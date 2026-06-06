require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const path    = require('path');
const sequelize = require('./config/database');

// Import Controllers
const orderController  = require('./controllers/orderController');
const repairController = require('./controllers/repairController');
const returnController = require('./controllers/returnController');
const authController   = require('./controllers/authController');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Static Frontend Serving
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ---- Admin Route Guard ---------------------------------------------------
function requireAdmin(req, res, next) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return next();
  if (req.headers['x-admin-key'] !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ---- API Routes ----------------------------------------------------------
app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// Auth Endpoints
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login',    authController.login);

// Order Endpoints
app.post('/api/orders',      orderController.createOrder);
app.get('/api/orders',       requireAdmin, orderController.listOrders);
app.get('/api/orders/:id',   requireAdmin, orderController.getOrder);

// Repair Endpoints
app.post('/api/repairs',     repairController.createRepairRequest);
app.get('/api/repairs',      requireAdmin, repairController.listRepairRequests);

// Return Endpoints
app.post('/api/returns',     returnController.createReturnRequest);
app.get('/api/returns',      requireAdmin, returnController.listReturnRequests);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[err]', err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5001;

// Connect to MySQL and sync models
sequelize.authenticate()
  .then(() => {
    console.log('[db] Connected to MySQL via XAMPP successfully.');
    // .sync() will automatically create the new Users table!
    return sequelize.sync(); 
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log('[api] Listening on http://localhost:' + PORT);
    });
  })
  .catch(err => {
    console.error('[db] MySQL connection failed:', err.message);
    process.exit(1);
  });