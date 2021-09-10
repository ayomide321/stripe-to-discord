const mongoose = require('mongoose');
const mongoSchema = mongoose.Schema;





//user schema
var UserSchema = new mongoSchema({
    subscriptions: [{
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
    }],
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

const UserDocument = mongoose.model('User', UserSchema);
export = UserDocument
