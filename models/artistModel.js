const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
    artistName: {
        type: String,
        required: true  
    },
    artistGenre: {
        type: String,
        required: true,
    },
    artistRate: {
        type: Number,
        required: true,
    },
    artistDescription: {
        type: String,
        required: true,
        maxLength: 500
    },
    artistImage: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now  
    }
});

const Artist = mongoose.model('artists', artistSchema);

module.exports = Artist;