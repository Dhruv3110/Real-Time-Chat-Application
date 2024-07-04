const mongoose= require('mongoose');
const messagesSchema = mongoose.Schema({
    converseId:{
        type: String,
    },
    senderId:{
        type: String,
    },
    message:{
        type: String,
    }
});
const messages = mongoose.model('messages',messagesSchema)
module.exports =messages;