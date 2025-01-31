const router = require("express").Router();
const userController = require('../controllers/userControllers')
const { authGuard } = require("../Middleware/authGuard");
 
// Creating user registration route
router.post('/create', userController.createUser)
 
//login routes
router.post('/login',userController.loginUser)

//profile
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);
 
// Controller(Export)-> Routes (import)-> use ->(index.js)
//verify otp and reset the password
router.post ('/verify_otp', userController.verifyOtpAndSetPassword)



//forgot password
router.post ('/forgot_password', userController.forgotPassword)

router.get("/token", userController.getToken);
router.get("/profile/get", userController.getCurrentProfile);


router.get(("/all"), userController.getAllUsers);
 
router.post('/logout', authGuard, userController.logoutUser);

//get user data
router.get('/user/:id',userController.getUserDetails);
 
//Exporting the routes
module.exports = router                                                                                                                 