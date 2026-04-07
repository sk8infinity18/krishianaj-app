const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { generateToken } = require('../utils/jwt');
const { generateOTP, saveOTP, verifyOTP, sendOTPSMS } = require('../utils/otp');

// ── FARMER REGISTER ──────────────────────────────────────────────────────
const farmerRegister = async (req, res) => {
  try {
    const { first_name, last_name, phone_number, farmer_id, password, farm_name, farm_state, farm_district } = req.body;

    if (!first_name || !last_name || !phone_number || !farmer_id || !password)
      return res.status(400).json({ success: false, message: 'All required fields must be filled' });

    const existing = await query(`SELECT id FROM farmers WHERE phone_number = $1 OR farmer_id = $2`, [phone_number, farmer_id]);
    if (existing.rows.length > 0)
      return res.status(409).json({ success: false, message: 'Phone number or Farmer ID already registered' });

    const password_hash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO farmers (first_name, last_name, phone_number, farmer_id, password_hash, farm_name, farm_state, farm_district)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, first_name, last_name, phone_number, farmer_id, farm_name`,
      [first_name, last_name, phone_number, farmer_id, password_hash, farm_name || null, farm_state || null, farm_district || null]
    );

    const farmer = result.rows[0];
    const token = generateToken({ id: farmer.id, role: 'farmer', phone: farmer.phone_number });
    res.status(201).json({ success: true, message: 'Farmer registered successfully', token, user: { ...farmer, role: 'farmer' } });
  } catch (err) {
    console.error('farmerRegister error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// ── CONSUMER REGISTER ─────────────────────────────────────────────────────
const consumerRegister = async (req, res) => {
  try {
    const { first_name, last_name, phone_number, email, password, delivery_city, delivery_state } = req.body;

    if (!first_name || !last_name || !phone_number || !password)
      return res.status(400).json({ success: false, message: 'All required fields must be filled' });

    const existing = await query(`SELECT id FROM consumers WHERE phone_number = $1`, [phone_number]);
    if (existing.rows.length > 0)
      return res.status(409).json({ success: false, message: 'Phone number already registered' });

    const password_hash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO consumers (first_name, last_name, phone_number, email, password_hash, delivery_city, delivery_state)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, first_name, last_name, phone_number, email`,
      [first_name, last_name, phone_number, email || null, password_hash, delivery_city || null, delivery_state || null]
    );

    const consumer = result.rows[0];
    const token = generateToken({ id: consumer.id, role: 'consumer', phone: consumer.phone_number });
    res.status(201).json({ success: true, message: 'Consumer registered successfully', token, user: { ...consumer, role: 'consumer' } });
  } catch (err) {
    console.error('consumerRegister error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// ── FARMER LOGIN (by first_name + password) ─────────────────────────────
const farmerLogin = async (req, res) => {
  try {
    const { first_name, password } = req.body;
    if (!first_name || !password)
      return res.status(400).json({ success: false, message: 'First name and password are required' });

    const result = await query(
      `SELECT * FROM farmers WHERE LOWER(first_name) = LOWER($1) AND is_active = TRUE LIMIT 5`,
      [first_name]
    );

    let farmer = null;
    for (const row of result.rows) {
      const match = await bcrypt.compare(password, row.password_hash);
      if (match) { farmer = row; break; }
    }

    if (!farmer) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken({ id: farmer.id, role: 'farmer', phone: farmer.phone_number });
    const { password_hash, ...farmerData } = farmer;
    res.json({ success: true, token, user: { ...farmerData, role: 'farmer' } });
  } catch (err) {
    console.error('farmerLogin error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// ── CONSUMER LOGIN (by phone + password) ────────────────────────────────
const consumerLogin = async (req, res) => {
  try {
    const { first_name, password } = req.body;
    if (!first_name || !password)
      return res.status(400).json({ success: false, message: 'First name and password are required' });

    const result = await query(`SELECT * FROM consumers WHERE LOWER(first_name) = LOWER($1) AND is_active = TRUE LIMIT 5`, [first_name]);
    if (!result.rows.length) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    let consumer = null;
    for (const row of result.rows) {
      const match = await bcrypt.compare(password, row.password_hash);
      if (match) {
        consumer = row;
        break;
      }
    }

    if (!consumer) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken({ id: consumer.id, role: 'consumer', phone: consumer.phone_number });
    const { password_hash, ...consumerData } = consumer;
    res.json({ success: true, token, user: { ...consumerData, role: 'consumer' } });
  } catch (err) {
    console.error('consumerLogin error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// ── SEND OTP (for password reset) ──────────────────────────────────────
const sendOTP = async (req, res) => {
  try {
    const { phone_number, user_type } = req.body;
    if (!phone_number || !user_type) return res.status(400).json({ success: false, message: 'Phone number and user type required' });

    const table = user_type === 'farmer' ? 'farmers' : 'consumers';
    const user = await query(`SELECT id FROM ${table} WHERE phone_number = $1 AND is_active = TRUE`, [phone_number]);
    if (!user.rows[0]) return res.status(404).json({ success: false, message: 'Account not found with this phone number' });

    const otp = generateOTP();
    await saveOTP(phone_number, otp, 'password_reset', user_type);
    await sendOTPSMS(phone_number, otp);

    res.json({ success: true, message: 'OTP sent to your registered phone number' });
  } catch (err) {
    console.error('sendOTP error:', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

// ── VERIFY OTP & RESET PASSWORD ─────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { phone_number, otp_code, new_password, user_type } = req.body;
    if (!phone_number || !otp_code || !new_password || !user_type)
      return res.status(400).json({ success: false, message: 'All fields required' });

    const valid = await verifyOTP(phone_number, otp_code, 'password_reset');
    if (!valid) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    const password_hash = await bcrypt.hash(new_password, 12);
    const table = user_type === 'farmer' ? 'farmers' : 'consumers';
    const result = await query(`UPDATE ${table} SET password_hash = $1, updated_at = NOW() WHERE phone_number = $2 RETURNING id`, [password_hash, phone_number]);

    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Account not found' });
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error('resetPassword error:', err);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
};

module.exports = { farmerRegister, consumerRegister, farmerLogin, consumerLogin, sendOTP, resetPassword };
