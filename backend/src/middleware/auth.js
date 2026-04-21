const { verifyToken } = require('../utils/jwt');
const { query } = require('../config/db');

const authenticateFarmer = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    const decoded = verifyToken(token);
    if (decoded.role !== 'farmer') return res.status(403).json({ success: false, message: 'Farmer access only' });

    const result = await query(`SELECT farmer_id, first_name, last_name FROM farmers WHERE farmer_id = $1`, [decoded.id]);
    if (!result.rows[0]) return res.status(401).json({ success: false, message: 'Account not found' });

    req.user = { ...result.rows[0], id: result.rows[0].farmer_id, role: 'farmer' };
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

    const result = await query(`SELECT consumer_id, first_name, last_name FROM consumers WHERE consumer_id = $1`, [decoded.id]);
    if (!result.rows[0]) return res.status(401).json({ success: false, message: 'Account not found' });

    req.user = { ...result.rows[0], id: result.rows[0].consumer_id, role: 'consumer' };
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
