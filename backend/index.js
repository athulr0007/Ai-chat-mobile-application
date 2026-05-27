require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Initialize Express App
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'EYE 1 AI Chat Backend API',
    version: '1.0.0',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    mode: process.env.GROQ_API_KEY ? 'live (Groq API)' : 'simulated (offline fallback)'
  });
});

// Register Routes
app.use('/auth', require('./routes/auth'));
app.use('/sessions', require('./routes/sessions'));
app.use('/chat', require('./routes/chat'));
app.use('/voice', require('./routes/voice'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error stack:', err.stack);
  res.status(500).json({
    msg: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Configure MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eye1';

console.log('Connecting to MongoDB at:', MONGODB_URI);
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('💚 MongoDB Database Connected Successfully!');
    // Start Express Server
    app.listen(PORT, () => {
      console.log(`🚀 EYE 1 Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
    console.log('⚠️ Running server with MOCKED database connection for instant usability...');
    
    // Fallback: If DB is down, we start server anyway to let the app function in pure simulated demo mode!
    // This is an extremely robust development pattern.
    app.listen(PORT, () => {
      console.log(`🚀 EYE 1 Backend running in pure MOCKED/OFFLINE mode on http://localhost:${PORT}`);
    });
  });
