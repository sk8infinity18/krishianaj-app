const router = require('express').Router();
const { placeOrder, getConsumerOrders, getFarmerOrders, updateOrderStatus, getFarmerEarnings } = require('../controllers/orderController');
const { authenticateConsumer, authenticateFarmer } = require('../middleware/auth');

router.post('/', authenticateConsumer, placeOrder);
router.get('/consumer', authenticateConsumer, getConsumerOrders);
router.get('/farmer', authenticateFarmer, getFarmerOrders);
router.get('/farmer/earnings', authenticateFarmer, getFarmerEarnings);
router.put('/:order_number/status', authenticateFarmer, updateOrderStatus);

module.exports = router;
