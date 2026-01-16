/**
 * AgroShare Backend Server
 * 
 * AI-Driven Farm Machinery Scheduling and Sharing Platform
 * Main entry point for the Express application
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const machineRoutes = require('./routes/machineRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Initialize Express app
const app = express();

// ===========================================
// Middleware Configuration
// ===========================================

// Enable CORS for cross-origin requests
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// ===========================================
// Database Connection
// ===========================================

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // Mongoose 6+ no longer needs these options, but included for compatibility
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

// ===========================================
// API Routes
// ===========================================

const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'AgroShare API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Mount routes
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/machines`, machineRoutes);
app.use(`${API_PREFIX}/bookings`, bookingRoutes);

// ===========================================
// Error Handling Middleware
// ===========================================

// 404 Handler - Route not found
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: messages
        });
    }
    
    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `Duplicate value for field: ${field}`
        });
    }
    
    // Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: `Invalid ${err.path}: ${err.value}`
        });
    }
    
    // Default server error
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// ===========================================
// Server Initialization
// ===========================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    // Connect to database
    await connectDB();
    
    // Start listening for requests
    app.listen(PORT, () => {
        console.log(`🚀 AgroShare Server running on port ${PORT}`);
        console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📍 API Base: http://localhost:${PORT}${API_PREFIX}`);
    });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
    process.exit(1);
});

// Start the server
startServer();

module.exports = app;

