const mongoose = require('mongoose');
import { Schema, Model, model, Document, Types } from 'mongoose';




interface subscriptionsType extends Document {
    id: Types.ObjectId,
    activeToken: string,
    product: string,
    activated: boolean,
    canceled: boolean,

}

//user schema
interface UserSchemaType extends Document {
    email: string,
    discord_id: string,
    roles: [id: string],
    tempRoles: [id: string],
    pendingChange: boolean,
    totalReferred: number,
    referral: string,
    referred: string,
    currentReferred: number,
    veteranUser: boolean,
    subscriptions: Types.Array<subscriptionsType>;
}

var UserSchema = new Schema({
    subscriptions: [new Schema<subscriptionsType>({
        _id: String,
        activeToken: String,
        product: String,
        activated: {
            type: Boolean,
            default: false
        },
        canceled: {
            type: Boolean,
            default: false,
        }
    })],
    discord_id: String,
    email: String,
    roles: [{
        id: String,
    }],
    tempRoles: [{
        id: String,
    }],
    pendingChange: {
        type: Boolean,
        default: false
    },
    totalReferred: {
        type: Number,
        default: 0,
    },
    currentReferred: {
        type: Number,
        default: 0,
    },
    referred: {
        type: String,
        default: "",
    },
    referral: {
        type: String,
        default: "",
    },
    
    veteranUser: {
        type: Boolean,
        default: false
    },

});

type UserModelType = Model<UserSchemaType>;
const UserDocument = model<UserSchemaType, UserModelType>('User', UserSchema);
export { UserDocument, UserSchemaType }