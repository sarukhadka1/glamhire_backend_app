const Wishlist = require('../models/wishlistModel');
const Artist = require('../models/artistModel');

const getUserWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('artists');
        if (!wishlist) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }
        res.status(200).json({
            success: true,
            data: wishlist.artists
        });
    } catch (error) {
        console.error('Error fetching user wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Add to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { artistId } = req.body;
        const artist = await Artist.findById(artistId);
        if (!artist) {
            return res.status(404).json({
                success: false,
                message: 'Artist not found'
            });
        }
   
        let wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user._id, artists: [artistId] });
        } else {
            if (!wishlist.artists.includes(artistId)) {
                wishlist.artists.push(artistId);
            }
        }
   
        await wishlist.save();
        res.status(200).json({
            success: true,
            message: 'Artist added to wishlist',
            data: wishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
  };
   
  // Remove from wishlist
  const removeFromWishlist = async (req, res) => {
    try {
        const { artistId } = req.params;
        let wishlist = await Wishlist.findOne({ user: req.user._id });
   
        if (wishlist) {
            wishlist.artists = wishlist.artists.filter(id => id.toString() !== artistId);
            await wishlist.save();
        }
   
        res.status(200).json({
            success: true,
            message: 'Artist removed from wishlist',
            data: wishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
  };

  module.exports = {
    getUserWishlist,
    addToWishlist,
    removeFromWishlist
}