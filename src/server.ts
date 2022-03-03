/// <reference path="../client.d.ts" />

import express from 'express'
import { CallbackError } from 'mongoose';
import { Stripe } from 'stripe';
import { UserDocument, UserSchemaType } from './data/models/user'
import sendMail from './functions/mail'
require('dotenv').config();

const stripe = require('stripe')(process.env.stripeToken);
const endpointSecret = process.env.endpointSecret
const app = express();


//Token generator function
function makeid(length: number) {
    var result           = '';
    var characters       = 'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789!@#$%&';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

// Stripe webhooks
app.post('/webhook', express.raw({type: 'application/json'}), async (request: express.Request, response: express.Response) => {
    const sig = request.headers['stripe-signature'];

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    }
    catch (err) {
      response.status(400).send(`Webhook Error: ${err}`);
      return;
    }

    // Handle the event
    switch (event.type) {

        case 'customer.subscription.created':
            const paymentIntent: Stripe.Subscription = event.data.object as Stripe.Subscription;
            const customer = await stripe.customers.retrieve(paymentIntent.customer);
            const product_id_created = (paymentIntent as any).plan.product

            const newToken = makeid(6);
            const subscriptionDoc = {
                _id: (paymentIntent as any).id,
                product: product_id_created,
                activeToken: newToken,
                activated: false,
            }
            const newCustomer = new UserDocument({
                email: customer.email,
                subscriptions: [subscriptionDoc],
            })

            var productQuery = {
                'email': customer.email,
            }
            sendMail(newCustomer.email, "verification", newToken)

            await UserDocument.findOneAndUpdate(
            productQuery,
            {'$setOnInsert': newCustomer},  
            {upsert: true, new: false},
            async function(err: CallbackError, doc: UserSchemaType | null) {
                if(err) throw err;
                if(!doc){
                    return;
                }

                const existing_sub = doc.subscriptions.find( ({ product }) => product === product_id_created)
                console.log(existing_sub)
                if(existing_sub){
                    if(existing_sub._id == subscriptionDoc._id) return "duplication error"
                    var productSub = existing_sub._id
                    console.log("An old identical subscription was found, deleting")
                    await stripe.subscriptions.update(productSub, { cancel_at_period_end: true });
                    existing_sub.set(subscriptionDoc);
                    doc!.save();
                    return
                } else {
                    doc.subscriptions.push(subscriptionDoc)
                    doc.save();
                    sendMail(newCustomer.email, "verification", newToken)
                    return
                }
            }).exec();
            

            
            //Check for product type
            //if(session.line_items.data[0].price.product == process.env.stock_prod)

            //referrals
            //const referral = makeid(7);
            //user.referral = referral;

            //send verification emails
            //mailgun.sendMail(user.email, "verification_template", user.activeToken)
            
            console.log("Created new subscription");
            break;

     
        case 'customer.subscription.updated':
            const updateObject: Stripe.Subscription = event.data.object as Stripe.Subscription;
                
            const updated_cus = await stripe.customers.retrieve(updateObject.customer);
            const product_id = (updateObject as any).plan.product
            const userExists = await UserDocument.exists({'email': updated_cus.email})

            //If account exists OR account is trying to end
            if(userExists || updated_cus.cancel_at_period_end == true){
                if(updated_cus.cancel_at_period_end == true)
                {

                    await UserDocument.findOneAndUpdate({
                        "email": updated_cus.email,
                        "subscriptions.product": product_id, 
                        "subscriptions.canceled": false,}, 
                        {$set: {"subscriptions.canceled":true}}, 
                        { upsert: false, returnDocument: 'after'},
                        function(err: CallbackError, doc: UserSchemaType | null) {
                            if(err) throw err;
                            
                            //SEND EMAIL THAT USER WAS CANCELED

                            //mailgun.sendMail(updated_cus.email, "set_cancel")
                        }); 
                } 
            } else {
                //Create Account
                
                const subscriptionDoc = {
                    _id: updateObject.id,
                    product: product_id,
                    activeToken: makeid(6),
                    activated: false,
                }
                const newCustomer = new UserDocument({
                    email: updated_cus.email,
                    subscriptions: [subscriptionDoc],
                })
                await UserDocument.create(newCustomer).then(
                    //SEND EMAIL THAT A NEW ACCOUNT WAS CREATED
                    
                )

            }
            break;

        case 'customer.subscription.deleted':

            const canceled_customer: Stripe.Subscription = event.data.object as Stripe.Subscription;
            const deleted_customer = await stripe.customers.retrieve(canceled_customer.customer);
            const deleted_product_id = canceled_customer.id

            //Check for product type
            //if(session_del == process.env.stock_prod)
            
            try {
                await UserDocument.updateOne({
                    "email": deleted_customer.email, "subscriptions._id": deleted_product_id},
                {$pull: { subscriptions: {_id: deleted_product_id}}}).exec()
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

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is live on port ${port}`));
