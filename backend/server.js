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

// Initialize Express app
const app = express();

// Track if using mock data
let useMockData = false;

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
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ===========================================
// Database Connection
// ===========================================

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/agroshare';
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return true;
    } catch (error) {
        console.warn(`⚠️ MongoDB Connection Failed: ${error.message}`);
        console.log('📦 Starting in DEMO MODE with in-memory data...');
        return false;
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
        mode: useMockData ? 'demo' : 'production',
        timestamp: new Date().toISOString()
    });
});

// Routes will be mounted after DB connection attempt
// See startServer() function

// ===========================================
// Mock Routes Setup
// ===========================================

const setupMockRoutes = () => {
    const express = require('express');
    
    // Mock User Routes
    const userRouter = express.Router();
    const mockUserController = require('./controllers/mock/userController');
    userRouter.post('/register', mockUserController.registerUser);
    userRouter.post('/login', mockUserController.loginUser);
    userRouter.get('/', mockUserController.getAllUsers);
    userRouter.get('/:id', mockUserController.getUserProfile);
    userRouter.put('/:id', mockUserController.updateUserProfile);
    userRouter.delete('/:id', mockUserController.deleteUser);
    
    // Mock Machine Routes
    const machineRouter = express.Router();
    const mockMachineController = require('./controllers/mock/machineController');
    machineRouter.get('/types/all', mockMachineController.getMachineTypes);
    machineRouter.get('/nearby', mockMachineController.getNearbyMachines);
    machineRouter.get('/owner/:ownerId', mockMachineController.getMachinesByOwner);
    machineRouter.get('/', mockMachineController.getAllMachines);
    machineRouter.get('/:id', mockMachineController.getMachineById);
    machineRouter.post('/', mockMachineController.addMachine);
    machineRouter.put('/:id', mockMachineController.updateMachine);
    machineRouter.patch('/:id/availability', mockMachineController.updateAvailability);
    machineRouter.delete('/:id', mockMachineController.deleteMachine);
    
    // Mock Booking Routes
    const bookingRouter = express.Router();
    const mockBookingController = require('./controllers/mock/bookingController');
    bookingRouter.get('/schedule/:date', mockBookingController.getScheduleByDate);
    bookingRouter.post('/schedule/optimize', mockBookingController.getOptimizedSchedule);
    bookingRouter.get('/farmer/:farmerId', mockBookingController.getBookingsByFarmer);
    bookingRouter.get('/owner/:ownerId', mockBookingController.getBookingsByOwner);
    bookingRouter.get('/machine/:machineId', mockBookingController.getBookingsByMachine);
    bookingRouter.get('/', mockBookingController.getAllBookings);
    bookingRouter.get('/:id', mockBookingController.getBookingById);
    bookingRouter.post('/', mockBookingController.createBooking);
    bookingRouter.patch('/:id/status', mockBookingController.updateBookingStatus);
    bookingRouter.post('/:id/rating', mockBookingController.addRating);
    bookingRouter.delete('/:id', mockBookingController.cancelBooking);
    
    app.use(`${API_PREFIX}/users`, userRouter);
    app.use(`${API_PREFIX}/machines`, machineRouter);
    app.use(`${API_PREFIX}/bookings`, bookingRouter);
    
    console.log('📦 Mock routes loaded successfully');
};

// ===========================================
// Production Routes Setup
// ===========================================

const setupProductionRoutes = () => {
    const userRoutes = require('./routes/userRoutes');
    const machineRoutes = require('./routes/machineRoutes');
    const bookingRoutes = require('./routes/bookingRoutes');
    
    app.use(`${API_PREFIX}/users`, userRoutes);
    app.use(`${API_PREFIX}/machines`, machineRoutes);
    app.use(`${API_PREFIX}/bookings`, bookingRoutes);
    
    console.log('🔌 Production routes loaded successfully');
};

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
    // Try to connect to database
    const dbConnected = await connectDB();
    
    // Setup routes based on DB connection
    if (dbConnected) {
        setupProductionRoutes();
    } else {
        useMockData = true;
        setupMockRoutes();
    }
    
    // Start listening for requests
    app.listen(PORT, () => {
        console.log(`🚀 AgroShare Server running on port ${PORT}`);
        console.log(`📍 Mode: ${useMockData ? 'DEMO (in-memory data)' : 'PRODUCTION (MongoDB)'}`);
        console.log(`📍 API Base: http://localhost:${PORT}${API_PREFIX}`);
    });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
});

// Start the server
startServer();

module.exports = app;

