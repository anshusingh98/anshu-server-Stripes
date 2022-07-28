const mongoose =  require('mongoose');
const schema = mongoose.Schema;
const customer = new schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    country:{
        type:String,
        require:true
    },
    amount:{
        type:Number,
        require:true
    }
})
module.exports = mongoose.model('customer', customer);

