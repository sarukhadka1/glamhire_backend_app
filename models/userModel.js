


// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   firstName: {
//     type: String,
//     require: true
//   },
//   lastName: {
//     type: String,
//     require: true
//   },
//   email: {
//     type: String,
//     require: true,
//     unique: true
//   },
//   phone: {
//     type: Number,
//     require: true,
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   isAdmin: {
//     type: Boolean,
//     default: false
//   },
//   resetPasswordOTP: {
//     type: Number,
//     default: null
//   },
//   loginAttempts: {
//     type: Number,
//     default: 0
//   },
//   lockUntil: {
//     type: Date,
//   },
//   resetPasswordExpires: {
//     type: Date,
//     default: null
//   },
//   // Added for password history and last-changed tracking
//   passwordHistory: {
//     type: [String],
//     default: []
//   },
//   passwordLastChanged: {
//     type: Date,
//     default: null
//   }
// });

// // Virtual field to check if the user is currently locked
// userSchema.virtual("isLocked").get(function () {
//   // `lockUntil` is in the future, means user is locked
//   return this.lockUntil && this.lockUntil > Date.now();
// });

// // Pre-save middleware to handle password history limit
// userSchema.pre("save", async function (next) {
//   const PASSWORD_HISTORY_LIMIT = 5; // Keep up to 5 old passwords
//   // Only run if password is modified
//   if (this.isModified("password")) {
//     // If passwordHistory length >= limit, remove the oldest
//     if (this.passwordHistory.length >= PASSWORD_HISTORY_LIMIT) {
//       this.passwordHistory.shift();
//     }
//     // Push the new password into history
//     this.passwordHistory.push(this.password);
//     // Update the time the password was last changed
//     this.passwordLastChanged = Date.now();
//   }
//   next();
// });

// const User = mongoose.model('users', userSchema);

// module.exports = User;


const mongoose = require("mongoose");
 
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  resetPasswordOTP: {
    type: Number,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
  loginAttempts: {
    type: Number,
    default: 0, // Track the number of failed login attempts
  },
  lockUntil: {
    type: Date, // Lockout expiration timestamp
    default: null,
  },
  passwordHistory: {
    type: [String], // Array to store hashed passwords for reuse prevention
    default: [],
  },
  passwordLastChanged: {
    type: Date, // Track the last time the password was changed
    default: null,
  },
  isLoggedIn: { // Newly added field
    type: Boolean,
    default: false,
  },
  twoFactorOTP: { // New Field for 2FA OTP
    type: Number,
    default: null,
  },
  twoFactorExpires: { // New Field for 2FA OTP Expiry
    type: Date,
    default: null,
  },
});
 
// Add a virtual field to calculate if the user is currently locked
userSchema.virtual("isLocked").get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});
 
// Add pre-save middleware to limit password history
userSchema.pre("save", async function (next) {
  const PASSWORD_HISTORY_LIMIT = 5; // Max number of past passwords to store
  if (this.isModified("password")) {
    // Ensure the password history only keeps the last `PASSWORD_HISTORY_LIMIT` entries
    if (this.passwordHistory.length >= PASSWORD_HISTORY_LIMIT) {
      this.passwordHistory.shift(); // Remove the oldest password
    }
    this.passwordHistory.push(this.password); // Add the new password to history
    this.passwordLastChanged = Date.now(); // Update the password change timestamp
  }
  next();
});
 
const User = mongoose.model("users", userSchema);
 
module.exports = User;