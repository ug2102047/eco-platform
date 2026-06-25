const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const airQualityRoutes = require('./routes/airQuality');
const waterQualityRoutes = require('./routes/waterQuality');
const weatherRoutes = require('./routes/weather');
const disastersRoutes = require('./routes/naturalDisaster');
const carbonRoutes = require('./routes/carbon');
const seedRoutes = require('./routes/seed');
const wasteRoutes = require('./routes/waste');
const biodiversityRoutes = require('./routes/biodiversity');
const communityRoutes = require('./routes/community');

const app = express();
const PORT = process.env.PORT || 5000;

// Verify JWT_SECRET is loaded
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env file');
  process.exit(1);
}

console.log('JWT_SECRET loaded successfully');

// CORS Configuration - Production Ready
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://eco-platform-web.onrender.com',
      'http://localhost:3000', // Local development
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Authorization', 'X-Total-Count'],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200
};

// Apply CORS globally
app.use(cors(corsOptions));

// Explicit OPTIONS handler for preflight requests
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Basic Routes
app.get('/', (req, res) => {
  res.json({ message: 'Eco Platform API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is healthy' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/air-quality', airQualityRoutes);
app.use('/api/water-quality', waterQualityRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/disasters', disastersRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/biodiversity', biodiversityRoutes);
app.use('/api/community', communityRoutes);

// Global error handler - returns JSON instead of HTML
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler - returns JSON instead of HTML
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
