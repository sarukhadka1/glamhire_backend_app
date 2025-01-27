const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    artists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "artists",
        required: true
    }]
});

const Wishlist = mongoose.model('wishlist', wishlistSchema);  
module.exports = Wishlist;