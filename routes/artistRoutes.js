const router = require('express').Router();
const artistController = require('../controllers/artistController'); // Adjust the path if necessary


// Create an artist
router.post('/create', artistController.createArtist);

// Fetch all artists
router.get('/get_all_artists',artistController.getAllArtists);

// Get a single artist
router.get('/get_single_artist/:id',artistController.getSingleArtist);

// Delete an artist
router.delete('/delete_artist/:id',artistController.deleteArtist);

// Update an artist
router.put('/update_artist/:id',artistController.updateArtist);

// Pagination for artists
router.get('/pagination', artistController.paginationArtists); // Assume function name, check if it exists

// Count number of artists
router.get("/get_artists_count", artistController.getArtistsCount);

module.exports = router;