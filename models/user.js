const mongoose = require('mongoose');

const userSchema = {
    email: String,
    password: String 
};

module.exports = new mongoose.model('User', userSchema);