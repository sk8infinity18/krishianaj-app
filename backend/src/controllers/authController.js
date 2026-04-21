const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { generateToken } = require('../utils/jwt');

const farmerRegister = async (req, res) => {
  try {
    const { first_name, last_name, farmer_id, password, farm_name, farm_state, farm_district } = req.body;

    if (!first_name || !last_name || !farmer_id || !password) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled' });
    }

    const existing = await query(`SELECT farmer_id FROM farmers WHERE LOWER(farmer_id) = LOWER($1)`, [farmer_id]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Person already registered' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO farmers (first_name, last_name, farmer_id, password_hash, farm_name, farm_state, farm_district)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING first_name, last_name, farmer_id, farm_name`,
      [first_name, last_name, farmer_id, password_hash, farm_name || null, farm_state || null, farm_district || null]
    );

    const farmer = result.rows[0];
    const token = generateToken({ id: farmer.farmer_id, role: 'farmer' });
    res.status(201).json({ success: true, message: 'Farmer registered successfully', token, user: { ...farmer, role: 'farmer' } });
  } catch (err) {
    console.error('farmerRegister error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

const consumerRegister = async (req, res) => {
  try {
    const { first_name, last_name, consumer_id, password, delivery_city, delivery_state } = req.body;

    if (!first_name || !last_name || !consumer_id || !password) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled' });
    }

    const existing = await query(`SELECT consumer_id FROM consumers WHERE LOWER(consumer_id) = LOWER($1)`, [consumer_id]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Person already registered' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO consumers (first_name, last_name, consumer_id, password_hash, delivery_city, delivery_state)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING first_name, last_name, consumer_id`,
      [first_name, last_name, consumer_id, password_hash, delivery_city || null, delivery_state || null]
    );

    const consumer = result.rows[0];
    const token = generateToken({ id: consumer.consumer_id, role: 'consumer' });
    res.status(201).json({ success: true, message: 'Consumer registered successfully', token, user: { ...consumer, role: 'consumer' } });
  } catch (err) {
    console.error('consumerRegister error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

const farmerLogin = async (req, res) => {
  try {
    const { farmer_id, password } = req.body;
    if (!farmer_id || !password) {
      return res.status(400).json({ success: false, message: 'Farmer ID and password are required' });
    }

    const result = await query(`SELECT * FROM farmers WHERE LOWER(farmer_id) = LOWER($1)`, [farmer_id]);
    const farmer = result.rows[0];
    if (!farmer) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, farmer.password_hash);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken({ id: farmer.farmer_id, role: 'farmer' });
    const { password_hash, ...farmerData } = farmer;
    res.json({ success: true, token, user: { ...farmerData, role: 'farmer' } });
  } catch (err) {
    console.error('farmerLogin error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

const consumerLogin = async (req, res) => {
  try {
    const { consumer_id, password } = req.body;
    if (!consumer_id || !password) {
      return res.status(400).json({ success: false, message: 'Consumer ID and password are required' });
    }

    const result = await query(`SELECT * FROM consumers WHERE LOWER(consumer_id) = LOWER($1)`, [consumer_id]);
    const consumer = result.rows[0];
    if (!consumer) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, consumer.password_hash);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken({ id: consumer.consumer_id, role: 'consumer' });
    const { password_hash, ...consumerData } = consumer;
    res.json({ success: true, token, user: { ...consumerData, role: 'consumer' } });
  } catch (err) {
    console.error('consumerLogin error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { role, identifier, new_password } = req.body;
    if (!role || !identifier || !new_password) {
      return res.status(400).json({ success: false, message: 'Account ID and new password are required' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const password_hash = await bcrypt.hash(new_password, 12);
    const table = role === 'farmer' ? 'farmers' : role === 'consumer' ? 'consumers' : null;
    const idColumn = role === 'farmer' ? 'farmer_id' : role === 'consumer' ? 'consumer_id' : null;
    if (!table) return res.status(400).json({ success: false, message: 'Invalid account type' });

    const result = await query(
      `UPDATE ${table} SET password_hash = $1 WHERE LOWER(${idColumn}) = LOWER($2) RETURNING ${idColumn}`,
      [password_hash, identifier]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Account not found' });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('forgotPassword error:', err);
    res.status(500).json({ success: false, message: 'Failed to update password' });
  }
};

module.exports = { farmerRegister, consumerRegister, farmerLogin, consumerLogin, forgotPassword };
