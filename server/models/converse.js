const mongoose= require('mongoose');
const converseSchema = mongoose.Schema({
    members:{
        type:Array,
        required:true,
    }

});
const converse = mongoose.model('converse',converseSchema)
module.exports = converse;