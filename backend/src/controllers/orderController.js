const { query, getClient } = require('../config/db');

const generateOrderNumber = () => `KA${Date.now().toString().slice(-8)}${Math.floor(Math.random()*100)}`;

// Place order
const placeOrder = async (req, res) => {
  const client = await getClient();
  try {
    const consumer_id = req.user.id;
    const { listing_id, quantity, delivery_address, delivery_city, delivery_state, delivery_pincode, notes, payment_method } = req.body;
    const parsedQuantity = parseFloat(quantity);

    if (!listing_id || !quantity || !delivery_address)
      return res.status(400).json({ success: false, message: 'listing_id, quantity, delivery_address required' });
    if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0)
      return res.status(400).json({ success: false, message: 'Quantity must be greater than 0' });

    await client.query('BEGIN');
    const rollbackAndRespond = async (statusCode, message) => {
      await client.query('ROLLBACK');
      return res.status(statusCode).json({ success: false, message });
    };

    const listingRes = await client.query(
      `SELECT * FROM crop_listings WHERE id = $1 AND is_available = TRUE AND is_active = TRUE FOR UPDATE`, [listing_id]);
    if (!listingRes.rows[0]) return rollbackAndRespond(404, 'Listing not found or unavailable');

    const listing = listingRes.rows[0];
    if (parsedQuantity < listing.min_order_quantity)
      return rollbackAndRespond(400, `Minimum order is ${listing.min_order_quantity} ${listing.unit}`);
    if (parsedQuantity > listing.quantity)
      return rollbackAndRespond(400, `Only ${listing.quantity} ${listing.unit} available`);

    const total_amount = parsedQuantity * parseFloat(listing.price_per_unit);
    const order_number = generateOrderNumber();

    const orderRes = await client.query(
      `INSERT INTO orders (order_number, consumer_id, farmer_id, listing_id, quantity, unit, price_per_unit, total_amount,
        delivery_address, delivery_city, delivery_state, delivery_pincode, notes, payment_method)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [order_number, consumer_id, listing.farmer_id, listing_id, parsedQuantity, listing.unit,
        listing.price_per_unit, total_amount, delivery_address, delivery_city||null, delivery_state||null,
        delivery_pincode||null, notes||null, payment_method||'cod']
    );

    // Update listing quantity
    const newQty = parseFloat(listing.quantity) - parsedQuantity;
    await client.query(
      `UPDATE crop_listings SET quantity = $1, total_sold = total_sold + $2, is_available = $3, updated_at = NOW() WHERE id = $4`,
      [newQty, parsedQuantity, newQty > 0, listing_id]
    );

    await client.query('COMMIT');
    res.status(201).json({ success: true, message: 'Order placed successfully', order: orderRes.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('placeOrder error:', err);
    res.status(500).json({ success: false, message: 'Failed to place order' });
  } finally { client.release(); }
};

// Consumer: get my orders
const getConsumerOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let cond = `WHERE o.consumer_id = $1`;
    const params = [req.user.id];
    if (status) { cond += ` AND o.status = $2`; params.push(status); }
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(
      `SELECT o.*, cl.crop_name, cl.images, cl.unit, f.first_name || ' ' || f.last_name AS farmer_name, f.farm_name
       FROM orders o JOIN crop_listings cl ON o.listing_id = cl.id JOIN farmers f ON o.farmer_id = f.id
       ${cond} ORDER BY o.created_at DESC LIMIT $${params.length-1} OFFSET $${params.length}`, params);

    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error('getConsumerOrders error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// Farmer: get incoming orders
const getFarmerOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let cond = `WHERE o.farmer_id = $1`;
    const params = [req.user.id];
    if (status) { cond += ` AND o.status = $2`; params.push(status); }
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(
      `SELECT o.*, cl.crop_name, cl.images, c.first_name || ' ' || c.last_name AS consumer_name, c.phone_number AS consumer_phone
       FROM orders o JOIN crop_listings cl ON o.listing_id = cl.id JOIN consumers c ON o.consumer_id = c.id
       ${cond} ORDER BY o.created_at DESC LIMIT $${params.length-1} OFFSET $${params.length}`, params);

    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error('getFarmerOrders error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// Update order status (farmer)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    const existingOrder = await query(`SELECT id, status, total_amount FROM orders WHERE id = $1 AND farmer_id = $2`, [id, req.user.id]);
    if (!existingOrder.rows[0]) return res.status(404).json({ success: false, message: 'Order not found' });

    const currentStatus = existingOrder.rows[0].status;
    const allowedTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['dispatched', 'cancelled'],
      dispatched: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    if (currentStatus === status) {
      return res.json({ success: true, message: 'Order status updated', order: existingOrder.rows[0] });
    }

    if (!allowedTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({ success: false, message: `Cannot change order from ${currentStatus} to ${status}` });
    }

    const result = await query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 AND farmer_id = $3 RETURNING *`,
      [status, id, req.user.id]
    );

    // Update earnings on delivery
    if (status === 'delivered') {
      await query(`UPDATE farmers SET total_earnings = total_earnings + $1 WHERE id = $2`, [result.rows[0].total_amount, req.user.id]);
    }

    res.json({ success: true, message: 'Order status updated', order: result.rows[0] });
  } catch (err) {
    console.error('updateOrderStatus error:', err);
    res.status(500).json({ success: false, message: 'Failed to update order' });
  }
};

// Farmer earnings summary
const getFarmerEarnings = async (req, res) => {
  try {
    const farmer_id = req.user.id;
    const earnings = await query(
      `SELECT total_earnings FROM farmers WHERE id = $1`, [farmer_id]);
    const monthly = await query(
      `SELECT TO_CHAR(created_at, 'YYYY-MM') AS month, SUM(total_amount) AS revenue, COUNT(*) AS orders
       FROM orders WHERE farmer_id = $1 AND status = 'delivered'
       GROUP BY month ORDER BY month DESC LIMIT 6`, [farmer_id]);
    const topCrops = await query(
      `SELECT cl.crop_name, SUM(o.total_amount) AS revenue, SUM(o.quantity) AS qty_sold
       FROM orders o JOIN crop_listings cl ON o.listing_id = cl.id
       WHERE o.farmer_id = $1 AND o.status = 'delivered'
       GROUP BY cl.crop_name ORDER BY revenue DESC LIMIT 5`, [farmer_id]);

    res.json({ success: true, total_earnings: earnings.rows[0]?.total_earnings || 0, monthly: monthly.rows, top_crops: topCrops.rows });
  } catch (err) {
    console.error('getFarmerEarnings error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch earnings' });
  }
};

module.exports = { placeOrder, getConsumerOrders, getFarmerOrders, updateOrderStatus, getFarmerEarnings };
