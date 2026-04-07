const router = require('express').Router();
const { createListing, getListings, getListing, getFarmerListings, updateListing, deleteListing, getCategories } = require('../controllers/listingController');
const { authenticateFarmer } = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');

router.get('/', getListings);
router.get('/categories', getCategories);
router.get('/my', authenticateFarmer, getFarmerListings);
router.get('/:id', getListing);
router.post('/', authenticateFarmer, upload.array('images', 5), createListing);
router.put('/:id', authenticateFarmer, updateListing);
router.delete('/:id', authenticateFarmer, deleteListing);

module.exports = router;
