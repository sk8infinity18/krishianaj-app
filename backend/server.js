require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const fs = require('fs');

const app = express();
// Ensure uploads dir
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', app: 'KrishiAnaj API', time: new Date() }));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/listings', require('./src/routes/listings'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/reviews', require('./src/routes/reviews'));
app.use('/api/cart', require('./src/routes/cart'));
app.use('/api/profile', require('./src/routes/profile'));

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌾 KrishiAnaj API running on port ${PORT}`);
  console.log(`📡 Health: http://localhost:${PORT}/health`);
});

module.exports = app;
