const router = require('express').Router();
const { farmerRegister, consumerRegister, farmerLogin, consumerLogin, sendOTP, resetPassword } = require('../controllers/authController');

router.post('/farmer/register', farmerRegister);
router.post('/consumer/register', consumerRegister);
router.post('/farmer/login', farmerLogin);
router.post('/consumer/login', consumerLogin);
router.post('/send-otp', sendOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
