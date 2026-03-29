const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const assessmentRoutes = require('./routes/assessments');
const careerRoutes = require('./routes/careers');
const mentorRoutes = require('./routes/mentors');
const paymentRoutes = require('./routes/payments');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
// NOTE: /api/payments/webhook uses express.raw (mounted inside the payments router)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rate limiting
const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth requests, please try again later.' },
});

app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api', defaultLimiter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/payments', paymentRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
