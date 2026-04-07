const router = require('express').Router();
const { getFarmerProfile, updateFarmerProfile, getConsumerProfile, updateConsumerProfile } = require('../controllers/profileController');
const { authenticateFarmer, authenticateConsumer } = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');

router.get('/farmer', authenticateFarmer, getFarmerProfile);
router.get('/farmer/:id', getFarmerProfile);
router.put('/farmer', authenticateFarmer, upload.single('profile_image'), updateFarmerProfile);
router.get('/consumer', authenticateConsumer, getConsumerProfile);
router.put('/consumer', authenticateConsumer, upload.single('profile_image'), updateConsumerProfile);

module.exports = router;
