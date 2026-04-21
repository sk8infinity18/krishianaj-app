const { query } = require('../config/db');

const getCart = async (req, res) => {
  try {
    const result = await query(
      `SELECT ci.*, cl.crop_name, cl.price_per_unit, cl.unit, cl.images, cl.quantity AS available_qty,
              cl.is_available, f.first_name || ' ' || f.last_name AS farmer_name, f.farm_name
       FROM cart_items ci JOIN crop_listings cl ON ci.listing_id = cl.id
       JOIN farmers f ON cl.farmer_id = f.farmer_id
       WHERE ci.consumer_id = $1`, [req.user.id]);
    const total = result.rows.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0);
    res.json({ success: true, cart: result.rows, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch cart' });
  }
};

const addToCart = async (req, res) => {
  try {
    const { listing_id, quantity } = req.body;
    if (!listing_id || !quantity) return res.status(400).json({ success: false, message: 'listing_id and quantity required' });

    const listing = await query(`SELECT * FROM crop_listings WHERE id = $1 AND is_available = TRUE`, [listing_id]);
    if (!listing.rows[0]) return res.status(404).json({ success: false, message: 'Listing not available' });

    await query(
      `INSERT INTO cart_items (consumer_id, listing_id, quantity) VALUES ($1,$2,$3)
       ON CONFLICT (consumer_id, listing_id) DO UPDATE SET quantity = $3`,
      [req.user.id, listing_id, parseFloat(quantity)]
    );
    res.json({ success: true, message: 'Added to cart' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add to cart' });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const result = await query(`DELETE FROM cart_items WHERE listing_id = $1 AND consumer_id = $2`, [req.params.id, req.user.id]);
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Cart item not found' });
    res.json({ success: true, message: 'Removed from cart' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to remove from cart' });
  }
};

const clearCart = async (req, res) => {
  try {
    await query(`DELETE FROM cart_items WHERE consumer_id = $1`, [req.user.id]);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to clear cart' });
  }
};

module.exports = { getCart, addToCart, removeFromCart, clearCart };
