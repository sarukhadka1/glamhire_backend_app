const mongoose = require('mongoose');
 
const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'artists',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['Cash on arrival', 'Khalti Payment'],
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
 
const Booking = mongoose.model('bookings', bookingSchema);
module.exports = Booking;