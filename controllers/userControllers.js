const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sendOtp = require('../service/sendOtp');


// const LOCKOUT_CONFIG = [
//   { attempts: 5, lockTime: 15 * 1000 },        // Lock 15s after 5 attempts
//   { attempts: 10, lockTime: 60 * 1000 },       // Lock 1m after 10 attempts
//   { attempts: 15, lockTime: 5 * 60 * 1000 },   // Lock 5m after 15 attempts
//   { attempts: Infinity, lockTime: 60 * 60 * 1000 }, // Lock 1h after 20+ attempts
// ];

// const getLockTime = (attempts) => {
//   for (const config of LOCKOUT_CONFIG) {
//     if (attempts <= config.attempts) {
//       return config.lockTime;
//     }
//   }
//   return 0;
// };

// // ----------------------------------------
// // PASSWORD POLICY & HISTORY LIMIT
// // ----------------------------------------
// const PASSWORD_POLICY = {
//   minLength: 8,
//   maxLength: 20,
//   // Enforces: at least 1 uppercase, 1 lowercase, 1 digit, 1 special char
//   regex: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
// };

// const PASSWORD_HISTORY_LIMIT = 5;
// const PASSWORD_EXPIRY_DAYS = 90; // (if you need password expiry tracking)

// // Helper to validate the password
// function isPasswordValid(password) {
//   if (
//     password.length < PASSWORD_POLICY.minLength ||
//     password.length > PASSWORD_POLICY.maxLength ||
//     !PASSWORD_POLICY.regex.test(password)
//   ) {
//     return false;
//   }
//   return true;
// }

// // ----------------------------------------
// // CREATE USER (same structure as sample,
// // but with your policy checks)
// // ----------------------------------------
// const createUser = async (req, res) => {
//   const { firstName, lastName, email, phone, password } = req.body;

//   // Check required fields
//   if (!firstName || !lastName || !email || !phone || !password) {
//     return res.status(400).json({
//       success: false,
//       message: "Please enter all fields!",
//     });
//   }

//   // Validate password complexity
//   if (!isPasswordValid(password)) {
//     return res.status(400).json({
//       success: false,
//       message: "Password must meet complexity requirements!",
//     });
//   }

//   try {
//     // Check if user already exists
//     const existingUser = await userModel.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: "User already exists!",
//       });
//     }

//     // Hash the password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Create a new user with initial password history
//     const newUser = new userModel({
//       firstName,
//       lastName,
//       email,
//       phone,
//       password: hashedPassword,
//       // Keep track of password history & when it was last changed
//       passwordHistory: [hashedPassword],
//       passwordLastChanged: new Date(),
//     });

//     await newUser.save();

//     res.status(201).json({
//       success: true,
//       message: "User created successfully!",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error!",
//     });
//   }
// };

// // ----------------------------------------
// // LOGIN USER (Tiered lockout from sample)
// // ----------------------------------------
// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   // Check required fields
//   if (!email || !password) {
//     return res.status(400).json({
//       success: false,
//       message: "Please enter all fields!",
//     });
//   }

//   try {
//     // Find user by email
//     const user = await userModel.findOne({ email });
//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "User does not exist!",
//       });
//     }

//     // Check if user is currently locked
//     if (user.lockUntil && user.lockUntil > Date.now()) {
//       // Lock is active
//       const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000);
//       return res.status(403).json({
//         success: false,
//         message: "Account is locked due to multiple failed login attempts.",
//         remainingTime,
//       });
//     } else if (user.lockUntil && user.lockUntil <= Date.now()) {
//       // Lock time has passed; remove the lock, but DO NOT reset attempts
//       user.lockUntil = null;
//       await user.save();
//     }

//     // Verify password
//     const isValidPassword = await bcrypt.compare(password, user.password);
//     if (!isValidPassword) {
//       // Increment loginAttempts
//       user.loginAttempts = (user.loginAttempts || 0) + 1;

//       // Determine appropriate lock time
//       const lockTime = getLockTime(user.loginAttempts);

//       // If the user has hit the first threshold (5 attempts) or more
//       if (lockTime > 0 && user.loginAttempts >= LOCKOUT_CONFIG[0].attempts) {
//         user.lockUntil = Date.now() + lockTime;
//         await user.save();
//         return res.status(403).json({
//           success: false,
//           message: "Account locked due to multiple failed login attempts.",
//           remainingTime: lockTime / 1000, // seconds
//         });
//       }

//       // Still below lock threshold -> just save attempts
//       await user.save();

//       // Calculate how many attempts remain until next threshold
//       const currentTier = LOCKOUT_CONFIG.find(
//         (cfg) => user.loginAttempts <= cfg.attempts
//       );
//       const remainingAttempts = currentTier
//         ? currentTier.attempts - user.loginAttempts
//         : 0;

//       return res.status(400).json({
//         success: false,
//         message: "Incorrect password!",
//         remainingAttempts,
//       });
//     }

//     // If password is valid -> reset attempts & lock
//     user.loginAttempts = 0;
//     user.lockUntil = null;
//     await user.save();

//     // Generate JWT token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     res.status(200).json({
//       success: true,
//       message: "User logged in successfully!",
//       token,
//       userData: {
//         id: user._id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         isAdmin: user.isAdmin,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error!",
//     });
//   }
// };


// const changePassword = async (req, res) => {
//   const { email, currentPassword, newPassword } = req.body;

//   if (!email || !currentPassword || !newPassword) {
//     return res.status(400).json({
//       success: false,
//       message: "Please enter all fields!",
//     });
//   }

//   // Validate the new password
//   if (!isPasswordValid(newPassword)) {
//     return res.status(400).json({
//       success: false,
//       message: "New password must meet complexity requirements!",
//     });
//   }

//   try {
//     const user = await userModel.findOne({ email });

//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "User does not exist!",
//       });
//     }

//     // Verify the current password
//     const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

//     if (!isCurrentPasswordValid) {
//       return res.status(400).json({
//         success: false,
//         message: "Current password is incorrect!",
//       });
//     }

//     // Prevent password reuse
//     if (await isPasswordReused(user, newPassword)) {
//       return res.status(400).json({
//         success: false,
//         message: "New password cannot be one of your recent passwords!",
//       });
//     }

//     // Check if the password has expired
//     if (isPasswordExpired(user.passwordLastChanged)) {
//       return res.status(403).json({
//         success: false,
//         message: "Password has expired. Please change your password.",
//       });
//     }

//     // Hash the new password
//     const salt = await bcrypt.genSalt(10);
//     const hashedNewPassword = await bcrypt.hash(newPassword, salt);

//     // Update the user's password and password history
//     user.password = hashedNewPassword;
//     user.passwordHistory = [
//       hashedNewPassword,
//       ...user.passwordHistory.slice(0, PASSWORD_HISTORY_LIMIT - 1),
//     ];
//     user.passwordLastChanged = new Date();

//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "Password changed successfully!",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error!",
//     });
//   }
// };

const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 20,
  regex: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

// Track reused passwords and expiry
const PASSWORD_HISTORY_LIMIT = 5; // Number of previous passwords to store
const PASSWORD_EXPIRY_DAYS = 90; // Password expiry in days

// Function to validate password strength
const isPasswordValid = (password) => {
  if (
    password.length < PASSWORD_POLICY.minLength ||
    password.length > PASSWORD_POLICY.maxLength ||
    !PASSWORD_POLICY.regex.test(password)
  ) {
    return false;
  }
  return true;
};

// Function to check password reuse
const isPasswordReused = async (user, newPassword) => {
  for (const hashedOldPassword of user.passwordHistory || []) {
    if (await bcrypt.compare(newPassword, hashedOldPassword)) {
      return true;
    }
  }
  return false;
};

// Lockout tiers
const LOCKOUT_CONFIG = [
  { attempts: 5, lockTime: 15 * 1000 },       // Lock 15s after 5 attempts
  { attempts: 10, lockTime: 60 * 1000 },      // Lock 1m after 10 attempts
  { attempts: 15, lockTime: 5 * 60 * 1000 },  // Lock 5m after 15 attempts
  { attempts: Infinity, lockTime: 60 * 60 * 1000 }, // 1h after 20+ attempts
];

// Given current total attempts, find lock time from the config
const getLockTime = (attempts) => {
  for (const config of LOCKOUT_CONFIG) {
    if (attempts <= config.attempts) {
      return config.lockTime;
    }
  }
  return 0;
};

// Create User Function
const createUser = async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  // Check for missing fields
  if (!firstName || !lastName || !email || !phone || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter all fields!",
    });
  }

  // Validate password strength
  if (!isPasswordValid(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be 8-20 characters long, include uppercase, lowercase, numbers, and special characters!",
    });
  }

  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      passwordHistory: [hashedPassword], // Add initial password to history
      passwordLastChanged: new Date(), // Record the password change date
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

// Login User Function
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Check for missing fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter all fields!",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist!",
      });
    }

    // Check if user is locked
    if (user.isLocked) {
      // If the lock time has passed, remove the lock but DO NOT reset attempts
      if (user.lockUntil <= Date.now()) {
        user.lockUntil = null;
        // <-- IMPORTANT: do NOT reset user.loginAttempts here
        await user.save();
      } else {
        // If user is still locked, respond with time remaining
        const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000);
        return res.status(403).json({
          success: false,
          message: "Account is locked due to multiple failed login attempts.",
          remainingTime,
        });
      }
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      // Increment attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      // Determine lock time based on the *new* total attempts
      const lockTime = getLockTime(user.loginAttempts);

      // If the user meets the minimum attempts to be locked (5 or more)
      if (lockTime > 0 && user.loginAttempts >= LOCKOUT_CONFIG[0].attempts) {
        user.lockUntil = Date.now() + lockTime;
        await user.save();
        return res.status(403).json({
          success: false,
          message: "Account locked due to multiple failed login attempts.",
          remainingTime: lockTime / 1000, // lock time in seconds
        });
      }

      await user.save();
      return res.status(400).json({
        success: false,
        message: "Password not matched!",
        remainingAttempts:
          LOCKOUT_CONFIG.find((config) => user.loginAttempts <= config.attempts)
            ?.attempts - user.loginAttempts,
      });
    }

    // Check for password expiry
    if (user.passwordLastChanged) {
      const passwordLastChanged = new Date(user.passwordLastChanged);
      const passwordExpiryDate = new Date(
        passwordLastChanged.setDate(passwordLastChanged.getDate() + PASSWORD_EXPIRY_DAYS)
      );

      if (new Date() > passwordExpiryDate) {
        return res.status(400).json({
          success: false,
          message: "Password has expired. Please reset your password.",
        });
      }
    }

    // If password is correct, reset attempts & lock
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.isLoggedIn = true;
    console.log(`User ${user.email} is logging in. isLoggedIn set to ${user.isLoggedIn}`);
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      success: true,
      message: "User logged in successfully!",
      token,
      userData: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        isLoggedIn: user.isLoggedIn,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};



// Change Password Function
const changePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  // Check for missing fields
  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Please enter all fields!",
    });
  }

  // Validate new password strength
  if (!isPasswordValid(newPassword)) {
    return res.status(400).json({
      success: false,
      message:
        "New password must be 8-20 characters long, include uppercase, lowercase, numbers, and special characters!",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist!",
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect!",
      });
    }

    if (await isPasswordReused(user, newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be one of your recent passwords!",
      });
    }

    const randomSalt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, randomSalt);

    user.password = hashedNewPassword;
    user.passwordHistory = [hashedNewPassword, ...user.passwordHistory.slice(0, PASSWORD_HISTORY_LIMIT - 1)];
    user.passwordLastChanged = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

const getUserProfile = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1]; // Assuming Bearer token
  if (!token) {
    return res.status(401).json({ message: 'Authorization token is missing' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUserProfile = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1]; // Assuming Bearer token
  if (!token) {
    return res.status(401).json({ message: 'Authorization token is missing' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { firstName, lastName, phone, password } = req.body;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select('-password -resetPasswordOTP -resetPasswordExpires -passwordHistory'); // Exclude sensitive fields
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};
// Logout User Function
const logoutUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Assuming Bearer token
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isLoggedIn = false; // Set isLoggedIn to false
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User logged out successfully!',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


const forgotPassword = async (req, res) => {
  console.log(req.body);

  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Please enter your phone number",
    });
  }
  try {
    const user = await userModel.findOne({ phone: phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // Generate OTP
    const randomOTP = Math.floor(100000 + Math.random() * 900000);
    console.log(randomOTP);

    user.resetPasswordOTP = randomOTP;
    user.resetPasswordExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    // Send OTP to user phone number
    const isSent = await sendOtp(phone, randomOTP);

    if (!isSent) {
      return res.status(400).json({
        success: false,
        message: "Error in sending OTP",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP sent to your phone number",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const verifyOtpAndSetPassword = async (req, res) => {
  const { phone, otp, newPassword } = req.body;
  if (!phone || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'required fields are missing!'
    });
  }
  try {
    const user = await userModel.findOne({ phone: phone });

    // Verify otp
    if (user.resetPasswordOTP != otp) {
      return res.status(400).json({
        success: false,
        message: 'invalid otp!!'
      });
    }
    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP Expired!'
      });
    }
    // Password hash
    const randomSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, randomSalt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Response
    res.status(200).json({
      success: true,
      message: 'OTP verified and password updated!'
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'server error!'
    });
  }
};

const getCurrentProfile = async (req, res) => {
  // const id = req.user.id;
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'User fetched successfully',
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error,
    });
  }
};

const getToken = async (req, res) => {
  try {
    console.log(req.body);
    const { id } = req.body;

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    const jwtToken = await jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      (options = {
        expiresIn:
          Date.now() + process.env.JWT_TOKEN_EXPIRE * 24 * 60 * 60 * 1000 ||
          '1d',
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Token generated successfully!',
      token: jwtToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};
const getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id; // Assume you have user ID available in params
    const user = await User.findById(userId).select('firstName, lastName, phone');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

//Check incoming data
//Validate the password
//Find the user
//If found check password and send response
//If not found : register


//change password

// Exporting
module.exports = {
  createUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  verifyOtpAndSetPassword,
  getCurrentProfile,
  getToken,
  changePassword,
  getAllUsers,
  logoutUser,
  getUserDetails
}
