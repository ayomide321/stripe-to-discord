const {model, Schema, SchemaTypes} = require('mongoose');

module.exports = model('guild', new Schema({
    _id: String,
    general: { type: Object },
}));