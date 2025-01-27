const express =  require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const { authGuard } = require("../Middleware/authGuard");

router.post("/add",authGuard, wishlistController.addToWishlist);
router.get("/all",authGuard,  wishlistController.getUserWishlist);
router.delete("/remove/:artistId",authGuard,  wishlistController.removeFromWishlist);
 
module.exports = router
 