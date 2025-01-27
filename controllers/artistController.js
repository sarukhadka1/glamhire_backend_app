const path = require('path');
const artistModel = require('../models/artistModel');
const fs = require('fs'); // filesystem

const createArtist = async (req, res) => {
    // Check incoming data
    console.log(req.body);
    console.log(req.files);

    // Destructuring the body data (json)
    const {
        artistName,
        artistGenre,
        artistRate,
        artistDescription
    } = req.body;
 
    // Validation
    if (!artistName || !artistGenre || !artistRate || !artistDescription) {
        return res.status(400).json({
            "success": false,
            "message": "Please enter all fields"
        });
    }

    // Validate if there is an image
    if (!req.files || !req.files.artistImage) {
        return res.status(400).json({
            "success": false,
            "message": "Image not found"
        });
    }

    const { artistImage } = req.files;

    // Upload image
    const imageName = `${Date.now()}-${artistImage.name}`;
    const imageUploadPath = path.join(__dirname, `../public/artists/${imageName}`);

    try {
        await artistImage.mv(imageUploadPath);

        // Save to database
        const newArtist = new artistModel({
            artistName: artistName,
            artistGenre: artistGenre,
            artistRate: artistRate,
            artistDescription: artistDescription,
            artistImage: imageName
        });
        const artist = await newArtist.save();
        res.status(201).json({
            "success": true,
            "message": "Artist Created Successfully",
            "data": artist
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "success": false,
            "message": "Internal server error",
            "error": error
        });
    }
};

const getAllArtists = async (req, res) => {
    try {
        const allArtists = await artistModel.find({});
        res.status(201).json({
            "success": true,
            "message": "Artists Fetched Successfully",
            "artists": allArtists
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "success": false,
            "message": "Internal server error",
            "error": error
        });
    }
};

const getSingleArtist = async (req, res) => {
    const artistId = req.params.id;

    try {
        const artist = await artistModel.findById(artistId);
        res.status(201).json({
            "success": true,
            "message": "Artist Fetched!",
            "artist": artist
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "success": false,
            "message": "Internal server error",
            "error": error
        });
    }
};

const deleteArtist = async (req, res) => {
    try {
        await artistModel.findByIdAndDelete(req.params.id);
        res.status(201).json({
            "success": true,
            "message": "Artist deleted successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "success": false,
            "message": "Internal server error",
            "error": error
        });
    }
};

const updateArtist = async (req, res) => {
    try {
        if (req.files && req.files.artistImage) {
            const { artistImage } = req.files;
            const imageName = `${Date.now()}-${artistImage.name}`;
            const imageUploadPath = path.join(__dirname, `../public/artists/${imageName}`)

            await artistImage.mv(imageUploadPath);

            req.body.artistImage = imageName;

            if(req.body.artistImage){
                const existingArtist = await artistModel.findById(req.params.id);
                const oldImagePath = path.join(__dirname, `../public/artists/${existingArtist.artistImage}`)
                fs.unlinkSync(oldImagePath);
            }
        }

        const updatedArtist = await artistModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(201).json({
            "success": true,
            "message": "Artist Updated",
            "artist": updatedArtist
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "success": false,
            "message": "Internal Server Error",
            "error": error
        });
    }
};

//pagination
const paginationArtists = async (req, res) => {
    try {
      // Page number
      const PageNo = parseInt(req.query.page) || 1;
      // Items per page
      const resultPerPage = parseInt(req.query.limit) || 2;
      // Search query
      const searchQuery = req.query.q || '';
      const sortOrder = req.query.sort || 'asc';
  
      const filter = {};
      if (searchQuery) {
        filter.artistName = { $regex: searchQuery, $options: 'i' };
      }
  
      // Sorting
      const sort = sortOrder === 'asc' ? { artistRate: 1 } : { artistRate: -1 };
  
      // Find artists with filters, pagination, and sorting
      const artists = await artistModel
        .find(filter)
        .skip((PageNo - 1) * resultPerPage)
        .limit(resultPerPage)
        .sort(sort);
  
      // If the requested page has no results
      if (artists.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No artists found",
        });
      }
  
      // Send response
      res.status(200).json({
        success: true,
        message: "Artists fetched successfully",
        artists: artists,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error,
      });
    }
  };
  
  const getArtistsCount = async (req, res) => {
    try {
      const artistCount = await artistModel.countDocuments({});
      res.status(200).json({
        success: true,
        message: 'Artist count fetched successfully',
        artistCount: artistCount,
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
 

module.exports = {
    createArtist,
    getAllArtists,
    getSingleArtist,
    deleteArtist,
    updateArtist,
    paginationArtists,
    getArtistsCount
};