const router = require('express').Router();
const { getCart, addToCart, removeFromCart, clearCart } = require('../controllers/cartController');
const { authenticateConsumer } = require('../middleware/auth');

router.get('/', authenticateConsumer, getCart);
router.post('/', authenticateConsumer, addToCart);
router.delete('/clear', authenticateConsumer, clearCart);
router.delete('/:id', authenticateConsumer, removeFromCart);

module.exports = router;
