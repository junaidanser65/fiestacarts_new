require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const menuRoutes = require('./routes/menu');
const vendorsRoutes = require('./routes/vendors');
const db = require('./config/database');

const app = express();

// Middleware
// app.use(cors());

app.use(cors({ origin: "*" }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/vendors', vendorsRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Fiesta Carts Vendor App Backend API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0",  () => {
  console.log(`Server running on port ${PORT}`);
});
