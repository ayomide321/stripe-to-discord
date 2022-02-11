require('dotenv').config();

import express from 'express'
import  UserDocument  = require('./data/models/user');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.stripeToken);
const endpointSecret = 'whsec_3qqz8P7hMitc1eWAY5r43mKqNjWdlHKk'
const app = express();


function makeid(length: number) {
    var result           = '';
    var characters       = 'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789!@#$%&';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }


 app.post('/webhook', bodyParser.raw({type: 'application/json'}), async (request: any, response: any) => {
    const sig = request.headers['stripe-signature'];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    }
    catch (err) {
      response.status(400).send(`Webhook Error: ${err}`);
    }

    // Handle the event
    switch (event.type) {

        case 'checkout.session.completed':

            const paymentIntent = event.data.object;
            const customer = await stripe.customers.retrieve(paymentIntent.customer);
            const session = await stripe.checkout.sessions.retrieve(
            paymentIntent.id,
            {
                expand: ["line_items"],
            });

            const newToken = makeid(6);
            const subscriptionDoc = {
                _id: paymentIntent.id,
                product: session.line_items.data[0].price.product,
                activeToken: newToken,
                active: false,
            }
            const newCustomer = new UserDocument({
                email: customer.email,
                subscriptions: [subscriptionDoc],
            })

            var user = await UserDocument.findOne({"email": customer.email}, {$setOnInsert: newCustomer}, {upsert: true})
            var newUserCheck = user.subscriptions.findOne({"product" : session.line_items.data[0].price.product})._id == paymentIntent.id 
            if(newUserCheck)
            {
                await stripe.subscriptions.update(user.subscriptions.findOne({"product" : session.line_items.data[0].price.product})._id, { cancel_at_period_end: true });
                user.findOneAndDelete({"subscriptions.product" : session.line_items.data[0].price.product})
                console.log("An old identical subscription was found, deleting")
                user.subscriptions.push(subscriptionDoc)
                
                //insert verification email template being sent here
                return;
            }
            
            user.save();
            //Check for product type
            //if(session.line_items.data[0].price.product == process.env.stock_prod)

            //referrals
            //const referral = makeid(7);
            //user.referral = referral;

            //send verification emails
            //mailgun.sendMail(user.email, "verification_template", user.activeToken)
            
            console.log("Creating new subscription");
            break;

        // ... handle other event types
        case 'customer.subscriptions.updated':
            const update_session = await stripe.checkout.sessions.retrieve(
                event.data.object.id,
                {
                    expand: ["line_items"],
                });
                
            const updated_cus = await stripe.customers.retrieve(event.data.object.customer);
            if(updated_cus.cancel_at_period_end == true)
            {
                console.log("User is set to cancel")
                await UserDocument.findOneAndUpdate({"subscriptions.product": update_session.line_items.data[0].price.product, "subscriptions.canceled": false, "subscriptions.activated": true}, {$set: {"subscriptions.canceled":true}}, { upsert: false, returnDocument: 'after',},
                    function(err: Error, found: any) {
                        if(err) throw err;

                        //mailgun.sendMail(updated_cus.email, "set_cancel")
                    }); 
            }
            break;

        case 'customer.subscriptions.deleted':

            const canceled_customer = event.data.object;
            const deleted_customer = await stripe.customers.retrieve(canceled_customer.customer);
            
            const session_del = await stripe.checkout.sessions.retrieve(
                canceled_customer.id,
                {
                    expand: ["line_items"],
                });

            //Check for product type
            //if(session_del == process.env.stock_prod)
            
            try {
                await UserDocument.findOneAndDelete({"email": deleted_customer.email}, {"$.subscriptions.products": session_del.line_items.data[0].price.product}).exec()
            }
            catch(err){
                console.log(err);
            }
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
        }

    // Return a response to acknowledge receipt of the event
    response.json({received: true});
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is live on port ${port}`));
