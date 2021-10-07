require('dotenv').config();

import express from 'express'
import  UserDocument  = require('./data/models/user');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.stripeToken);
//const endpointSecret = process.env.endpointSecret;
//test endpoint secret
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

            let user;
            try {
                user = await UserDocument.findOne({"email": customer.email})
                if (user)
                    return user
            } catch(err) {
                return (err)
            }

            if(user)
            {
                if(user.subscriptions.findOne({"product" : session.line_items.data[0].price.product}))
                {
                    user.findOneAndDelete({"subscriptions.product" : session.line_items.data[0].price.product})
                    console.log("An old identical subscription was found, deleting")
                }
                console.log("Existing account was found, updating...")
                user.subscriptions.push(subscriptionDoc)
                user.save();
                //insert verification email template being sent here
                return;

            } else {
                console.log("User was created")
                user = new UserDocument;
                user.subscriptions.push(subscriptionDoc)
                user.email = customer.email;
                if(!user.email) user.email = "noemail";
                //insert verification email template
                user.save();
            }
            
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
                
            const subObject = event.data.object;

            const updated_cus = await stripe.customers.retrieve(subObject.customer);
            if(subObject.cancel_at_period_end == true)
            {
                console.log("User is set to cancel")
                //mailgun.sendMail(updated_cus.email, "set_cancel")
            }
            break;

        case 'customer.subscriptions.deleted':

            const canceled_customer = event.data.object;
            const deleted_customer = await stripe.customers.retrieve(canceled_customer.customer);
    
            const session_del = canceled_customer.plan.product;
            //Check for product type
            //if(session_del == process.env.stock_prod)
            
            const cancel_user = await UserDocument.findOne({"email": deleted_customer.email}).exec()
    
            if(!cancel_user)
            {
                console.log(`User ${deleted_customer.email} doesn't exist to cancel. `)
                return;
            }
            //mailgun.sendMail(deleted_customer.email, "final_cancel")
    
            try {
                if(cancel_user){
                    cancel_user.findOne({"subscriptions.id": canceled_customer.id}).canceled = true;
                    cancel_user.save();
                    console.log("Subscription is over");
                }
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
