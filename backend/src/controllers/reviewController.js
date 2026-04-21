const { query } = require('../config/db');

const addReview = async (req, res) => {
  try {
    const consumer_id = req.user.id;
    const { order_number, order_id, rating, review_text } = req.body;
    const reviewOrderNumber = order_number || order_id;
    if (!reviewOrderNumber || !rating) return res.status(400).json({ success: false, message: 'order_number and rating required' });

    const orderRes = await query(
      `SELECT * FROM orders WHERE order_number = $1 AND consumer_id = $2 AND status = 'delivered'`, [reviewOrderNumber, consumer_id]);
    if (!orderRes.rows[0]) return res.status(400).json({ success: false, message: 'Order not found or not delivered yet' });

    const order = orderRes.rows[0];
    const existing = await query(`SELECT id FROM reviews WHERE order_number = $1`, [reviewOrderNumber]);
    if (existing.rows[0]) return res.status(409).json({ success: false, message: 'Review already submitted for this order' });

    await query(
      `INSERT INTO reviews (order_number, consumer_id, farmer_id, listing_id, rating, review_text)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [reviewOrderNumber, consumer_id, order.farmer_id, order.listing_id, parseInt(rating), review_text || null]
    );

    // Recalculate farmer rating
    const avgRes = await query(`SELECT AVG(rating) AS avg, COUNT(*) AS cnt FROM reviews WHERE farmer_id = $1`, [order.farmer_id]);
    await query(`UPDATE farmers SET rating = $1, total_reviews = $2 WHERE farmer_id = $3`, [parseFloat(avgRes.rows[0].avg).toFixed(2), avgRes.rows[0].cnt, order.farmer_id]);

    res.status(201).json({ success: true, message: 'Review submitted' });
  } catch (err) {
    console.error('addReview error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
};

const getFarmerReviews = async (req, res) => {
  try {
    const { farmer_id } = req.params;
    const result = await query(
      `SELECT r.*, c.first_name || ' ' || c.last_name AS consumer_name, cl.crop_name
       FROM reviews r JOIN consumers c ON r.consumer_id = c.consumer_id JOIN crop_listings cl ON r.listing_id = cl.id
       WHERE r.farmer_id = $1 ORDER BY r.id DESC`, [farmer_id]);
    res.json({ success: true, reviews: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
};

const getMyFarmerReviews = async (req, res) => {
  req.params.farmer_id = req.user.id;
  return getFarmerReviews(req, res);
};

module.exports = { addReview, getFarmerReviews, getMyFarmerReviews };
