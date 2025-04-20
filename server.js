// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// تنظیمات EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nobitex', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const nobitexRoutes = require('./routes/nobitexRoutes');
app.use('/api', nobitexRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root endpoint - render index.ejs
app.get('/', async (req, res) => {
  try {
    // می‌توانید داده‌های مورد نیاز برای صفحه را اینجا آماده کنید
    const data = {
      title: 'Nobitex API Dashboard',
      description: 'مانیتورینگ و مدیریت API های نوبیتکس',
      endpoints: {
        health: '/health',
        orders: '/api/orders',
        trades: '/api/trades',
        marketStats: '/api/market-stats'
      }
    };
    
    res.render('index', data);
  } catch (error) {
    console.error('Error rendering index page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
