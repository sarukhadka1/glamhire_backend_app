// const jwt = require('jsonwebtoken');

// const authGuard = (req, res, next) => {
//     const authHeader = req.headers.authorization;

//     if (!authHeader) {
//         return res.status(400).json({
//             success: false,
//             message: "Auth header not found"
//         });
//     }

//     const token = authHeader.split(" ")[1];

//     if (!token) {
//         return res.status(400).json({
//             success: false,
//             message: "Token not found!"
//         });
//     }

//     try {
//         const decodedUserData = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decodedUserData;
//         next();
//     } catch (error) {
//         res.status(400).json({
//             success: false,
//             message: "Not authenticated!"
//         });
//     }
// };

// const adminGuard = (req, res, next) => {
//     const authHeader = req.headers.authorization;

//     if (!authHeader) {
//         return res.status(400).json({
//             success: false,
//             message: "Auth header not found"
//         });
//     }

//     const token = authHeader.split(" ")[1];

//     if (!token) {
//         return res.status(400).json({
//             success: false,
//             message: "Token not found!"
//         });
//     }

//     try {
//         const decodedUserData = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decodedUserData;

//         if (!req.user.isAdmin) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Permission Denied!"
//             });
//         }

//         next();
//     } catch (error) {
//         res.status(400).json({
//             success: false,
//             message: "Not authenticated!"
//         });
//     }
// };

// module.exports = {
//     authGuard,
//     adminGuard
// };
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
 
const authGuard =  async (req, res, next) => {
    const authHeader = req.headers.authorization;
 
    if (!authHeader) {
        return res.status(400).json({
            success: false,
            message: "Auth header not found"
        });
    }
 
    const token = authHeader.split(" ")[1];
 
    if (!token || token ==="") {
        return res.status(400).json({
            success: false,
            message: "Token not found!"
        });
    }
 
    try {
        const decodedUserData = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decodedUserData.id).select("-password");
        next();
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Not authenticated!"
        });
    }
};
 
const adminGuard = (req, res, next) => {
    const authHeader = req.headers.authorization;
 
    if (!authHeader) {
        return res.status(400).json({
            success: false,
            message: "Auth header not found"
        });
    }
 
    const token = authHeader.split(" ")[1];
 
    if (!token) {
        return res.status(400).json({
            success: false,
            message: "Token not found!"
        });
    }
 
    try {
        const decodedUserData = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedUserData;
 
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Permission Denied!"
            });
        }
 
        next();
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Not authenticated!"
        });
    }
};
 
module.exports = {
    authGuard,
    adminGuard
};
