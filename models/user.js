const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const userSchema =  new mongoose.Schema({
    email: String,
    password: String 
});

userSchema.plugin(encrypt, { secret : process.env.MONGO_SECRET, encryptedFields: ["password"] });
module.exports = new mongoose.model('User', userSchema);