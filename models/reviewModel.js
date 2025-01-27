const mongoose = require("mongoose");
 
const reviewSchema = new mongoose.Schema({
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "artist",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
}, { timestamps: true });
 
const Reviews = mongoose.model("reviews", reviewSchema);
 
module.exports = Reviews