const router = require('express').Router();
const { farmerRegister, consumerRegister, farmerLogin, consumerLogin, forgotPassword } = require('../controllers/authController');

router.post('/farmer/register', farmerRegister);
router.post('/consumer/register', consumerRegister);
router.post('/farmer/login', farmerLogin);
router.post('/consumer/login', consumerLogin);
router.post('/forgot-password', forgotPassword);

module.exports = router;
