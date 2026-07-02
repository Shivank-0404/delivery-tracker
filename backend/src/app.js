require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

const app = express();

// =========================
// Middleware
// =========================
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://delivery-tracker-blond-tau.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests like Postman, Swagger, curl (no Origin header)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// Serve Frontend Static Files
// =========================
app.use(express.static(path.join(__dirname, '../../frontend')));

// =========================
// API Routes
// =========================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/zones', require('./routes/zones'));
app.use('/api/rate-cards', require('./routes/rateCards'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/agents', require('./routes/agents'));

// =========================
// Swagger Documentation
// =========================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// =========================
// Health Check
// =========================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// =========================
// Catch-all Route
// =========================
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) {
    return next();
  }

  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// =========================
// Global Error Handler
// =========================
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

module.exports = app;