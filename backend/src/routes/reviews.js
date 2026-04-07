const router = require('express').Router();
const { addReview, getFarmerReviews } = require('../controllers/reviewController');
const { authenticateConsumer } = require('../middleware/auth');

router.post('/', authenticateConsumer, addReview);
router.get('/farmer/:farmer_id', getFarmerReviews);

module.exports = router;
