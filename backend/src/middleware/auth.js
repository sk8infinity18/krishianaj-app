const { verifyToken } = require('../utils/jwt');
const { query } = require('../config/db');

const authenticateFarmer = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    const decoded = verifyToken(token);
    if (decoded.role !== 'farmer') return res.status(403).json({ success: false, message: 'Farmer access only' });

    const result = await query(`SELECT id, first_name, last_name, farmer_id, is_active FROM farmers WHERE id = $1`, [decoded.id]);
    if (!result.rows[0] || !result.rows[0].is_active) return res.status(401).json({ success: false, message: 'Account not found or inactive' });

    req.user = { ...result.rows[0], role: 'farmer' };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const authenticateConsumer = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    const decoded = verifyToken(token);
    if (decoded.role !== 'consumer') return res.status(403).json({ success: false, message: 'Consumer access only' });

    const result = await query(`SELECT id, first_name, last_name, consumer_id, is_active FROM consumers WHERE id = $1`, [decoded.id]);
    if (!result.rows[0] || !result.rows[0].is_active) return res.status(401).json({ success: false, message: 'Account not found or inactive' });

    req.user = { ...result.rows[0], role: 'consumer' };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const authenticateAny = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = { authenticateFarmer, authenticateConsumer, authenticateAny };
