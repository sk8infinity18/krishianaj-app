const router = require('express').Router();
const { addReview, getFarmerReviews, getMyFarmerReviews } = require('../controllers/reviewController');
const { authenticateConsumer, authenticateFarmer } = require('../middleware/auth');

router.post('/', authenticateConsumer, addReview);
router.get('/farmer/me', authenticateFarmer, getMyFarmerReviews);
router.get('/farmer/:farmer_id', getFarmerReviews);

module.exports = router;
