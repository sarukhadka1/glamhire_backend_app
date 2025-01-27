const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sendOtp = require ('../service/sendOtp');
const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 20,
  regex: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, // Enforce complexity
};

const PASSWORD_HISTORY_LIMIT = 5; // Limit for previous passwords
const PASSWORD_EXPIRY_DAYS = 90; // Password expiry time (in days)

const createUser = async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  if (!firstName || !lastName || !email || !password || !phone) {
    return res.status(400).json({
      success: false,
      message: "Please enter all fields!",
    });
  }

  // Validate password
  if (!isPasswordValid(password)) {
    return res.status(400).json({
      success: false,
      message: "Password must meet complexity requirements!",
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

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save the new user
    const newUser = new userModel({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      passwordHistory: [hashedPassword], // Save the initial password
      passwordLastChanged: new Date(),
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User created successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};


// const createUser = async (req, res) => {
//     // res.send("Create user API is working!")

//     //1.Check incoming data
//     console.log(req.body);

//     //2.Destructure the incoming data
//     const { firstName, lastName, email, password, phone } = req.body;

//     //3.Validate the data
//     if (!firstName || !lastName || !email || !password || !phone) {
//         // res.send("Please enter all fields!")
//         return res.json({
//             "success": false,
//             "message": "Please enter all fields!"
//         });
//     }

//     // Validate phone number format (basic example, adjust regex as needed)
//     const phoneRegex = /^[0-9]{10}$/;
//     if (!phoneRegex.test(phone)) {
//         return res.json({
//             "success": false,
//             "message": "Please enter a valid phone number!"
//         });
//     }

//     //4.Error Handling(try catch)
//     try {
//         //5.Check if the user is already registered
//         const existingUser = await userModel.findOne({ email: email })
//         //5.1 If user found: send response
//         if (existingUser) {
//             return res.json({
//                 "success": false,
//                 "message": "User already exists!"
//             })
//         }

//         // Hashing / encryption of the password
//         const randomSalt = await bcrypt.genSalt(10)
//         const hashedPassword = await bcrypt.hash(password, randomSalt)

//         //5.2 If user is new:

//         const newUser = new userModel({
//             //Field : Client's Value
//             firstName: firstName,
//             lastName: lastName,
//             email: email,
//             phone: phone,
//             password: hashedPassword
            
//         })

//         //Save to database
//         await newUser.save()

//         //send the response
//         res.status(201).json({
//             "success": true,
//             "message": "User Created Successfully!"
//         })
//     } catch (error) {
//         console.log(error)
//         res.status(400).json({
//             "success": false,
//             "message": "Internal server Error!"
//         })
//     }

// }

// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({
//       success: false,
//       message: "Please enter all fields!",
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

//     // Check if password has expired
//     if (isPasswordExpired(user.passwordLastChanged)) {
//       return res.status(403).json({
//         success: false,
//         message: "Password has expired. Please change your password.",
//       });
//     }

//     // Check if account is locked due to multiple failed login attempts
//     if (user.lockUntil && user.lockUntil > Date.now()) {
//       const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000);
//       return res.status(403).json({
//         success: false,
//         message: "Account is locked.",
//         remainingTime,
//       });
//     }

//     const isValidPassword = await bcrypt.compare(password, user.password);

//     if (!isValidPassword) {
//       user.loginAttempts = (user.loginAttempts || 0) + 1;

//       if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
//         user.lockUntil = Date.now() + LOCK_TIME;
//         await user.save();
//         return res.status(403).json({
//           success: false,
//           message: "Account locked due to multiple failed login attempts.",
//         });
//       }

//       await user.save();
//       return res.status(400).json({
//         success: false,
//         message: "Incorrect password!",
//       });
//     }

//     // Reset login attempts on successful login
//     user.loginAttempts = 0;
//     user.lockUntil = undefined;
//     await user.save();

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

const MAX_LOGIN_ATTEMPTS = 5; // Maximum allowed login attempts before lockout
const LOCK_TIME = 15 * 60 * 1000; // Lockout time in milliseconds (15 minutes)

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password ) {
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

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000); // Lock time in seconds
      return res.status(403).json({
        success: false,
        message: "Account is locked due to multiple failed login attempts.",
        remainingTime, // Remaining lockout time
      });
    }

    // Check password validity
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      // Lock account if max attempts exceeded
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_TIME; // Set lock time
        await user.save();
        return res.status(403).json({
          success: false,
          message: "Account locked due to multiple failed login attempts.",
          remainingTime: LOCK_TIME / 1000, // Lock time in seconds
        });
      }

      await user.save();
      return res.status(400).json({
        success: false,
        message: "Incorrect password!",
        remainingAttempts: MAX_LOGIN_ATTEMPTS - user.loginAttempts, // Remaining attempts
      });
    }

    // Reset login attempts and lock status on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Token expiration time
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
        isAdmin: user.isAdmin,
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



// //login function
// const loginUser = async (req, res) => {
//     // res.send("Login API is working!")

//     //Check incoming data
//     console.log(req.body)

//     //Destructuring
//     const { email, password } = req.body;

//     //Validation
//     if (!email || !password) {
//         return res.status(400).json({
//             "success": false,
//             "message": "Please enter all fields!"
//         })
//     }


//     //try catch
//     try {

//         //find user (email)
//         const user = await userModel.findOne({ email: email })
//         //found data: firstName, lastName, email, password

//         //not found(error message)
//         if (!user) {
//             return res.status(400).json({
//                 "success": false,
//                 "message": "User does not exist!"
//             })
//         }

//         //compare password(bcrypt)
//         const isValidPassword = await bcrypt.compare(password, user.password)

//         //not valid(error)
//         if (!isValidPassword) {
//             return res.status(400).json({
//                 "success": false,
//                 "message": "Password not matched!"
//             })
//         }
//         //token(Generate - user Data+KEY)  
//         const token = await jwt.sign(
//             { id: user._id },
//             process.env.JWT_SECRET
//         )
//         //response (token, user data)
//         res.status(201).json({
//             "success": true,
//             "message": "User logged in successfully!",
//             "token": token,
//             "userData": user
//         })


//     } catch (error) {
//         console.log(error)
//         return res.status(400).json({
//             "success": false,
//             "message": "Please enter all fields!"
//         })
//     }
// }

const changePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Please enter all fields!",
    });
  }

  // Validate the new password
  if (!isPasswordValid(newPassword)) {
    return res.status(400).json({
      success: false,
      message: "New password must meet complexity requirements!",
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

    // Verify the current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect!",
      });
    }

    // Prevent password reuse
    if (await isPasswordReused(user, newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be one of your recent passwords!",
      });
    }

    // Check if the password has expired
    if (isPasswordExpired(user.passwordLastChanged)) {
      return res.status(403).json({
        success: false,
        message: "Password has expired. Please change your password.",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password and password history
    user.password = hashedNewPassword;
    user.passwordHistory = [
      hashedNewPassword,
      ...user.passwordHistory.slice(0, PASSWORD_HISTORY_LIMIT - 1),
    ];
    user.passwordLastChanged = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error!",
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

// Function to validate password strength
const isPasswordValid = (password) => {
  return (
    password.length >= PASSWORD_POLICY.minLength &&
    password.length <= PASSWORD_POLICY.maxLength &&
    PASSWORD_POLICY.regex.test(password)
  );
};

// Function to check if the password is reused
const isPasswordReused = async (user, newPassword) => {
  for (const hashedOldPassword of user.passwordHistory || []) {
    if (await bcrypt.compare(newPassword, hashedOldPassword)) {
      return true;
    }
  }
  return false;
};

// Function to check if the password has expired
const isPasswordExpired = (passwordLastChanged) => {
  const expiryDate = new Date(passwordLastChanged);
  expiryDate.setDate(expiryDate.getDate() + PASSWORD_EXPIRY_DAYS);
  return new Date() > expiryDate;
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
      const decoded =jwt.verify(token,process.env.JWT_SECRET);
     
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
    changePassword
}
