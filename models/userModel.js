const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstName : {
        type: String,
        require : true
    },
    lastName : {
        type: String,
        require : true
    },
    email : {
        type : String,
        require : true,
        unique : true
    },
    phone : {
        type : Number,
        require : true,
        
    },
    password : {
        type : String,
        required : true
    },
    isAdmin : {
        type: Boolean,
        default: false
    },
    resetPasswordOTP:{
        type: Number,
        default: null
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil:{
        type: Date,
    },
    
    resetPasswordExpires:{
        type:Date,
        default: null
    }
})

const User = mongoose.model('users', userSchema)
module.exports = User;