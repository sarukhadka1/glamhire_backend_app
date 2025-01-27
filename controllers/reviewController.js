const Reviews = require("../models/reviewModel");

exports.addReview = async (req, res) => {
    const { artistId, rating, comment } = req.body;
    const userId = req.user._id; // Ensure req.user is populated from authentication middleware

    try {
        const review = new Reviews({ artistId, userId, rating, comment });
        await review.save();
        res.status(201).json({ message: "Review added successfully", review });
    } catch (error) {
        res.status(500).json({ message: "Failed to add review", error });
    }
};

exports.getReviewsByArtist = async (req, res) => {
    console.log(req.params.artistId);
    const artistId = req.params.artistId;

    try {
        const reviews = await Reviews.find({ artistId: artistId })
            

        res.status(200).json({ reviews });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch reviews", error });
    }
};
/////////
