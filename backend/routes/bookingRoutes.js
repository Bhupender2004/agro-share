/**
 * Booking Routes
 * 
 * API endpoints for booking management and scheduling
 */

const express = require('express');
const router = express.Router();
const {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
    cancelBooking,
    confirmBooking,
    completeBooking,
    scheduleBookings,
    getBookingsByFarmer,
    getBookingsByOwner,
    getMachineSchedule
} = require('../controllers/bookingController');

// ===========================================
// Scheduling Routes
// ===========================================

/**
 * @route   POST /api/v1/bookings/schedule
 * @desc    Auto-schedule pending bookings for a date
 * @access  Public (Admin/Owner in production)
 * @body    date (required), machineId (optional)
 */
router.post('/schedule', scheduleBookings);

/**
 * @route   GET /api/v1/bookings/schedule/:machineId
 * @desc    Get schedule for a specific machine
 * @access  Public
 * @query   date (required)
 */
router.get('/schedule/:machineId', getMachineSchedule);

// ===========================================
// User-specific Routes
// ===========================================

/**
 * @route   GET /api/v1/bookings/farmer/:farmerId
 * @desc    Get all bookings by a farmer
 * @access  Public (Farmer only in production)
 * @query   status (optional)
 */
router.get('/farmer/:farmerId', getBookingsByFarmer);

/**
 * @route   GET /api/v1/bookings/owner/:ownerId
 * @desc    Get all bookings for an owner's machines
 * @access  Public (Owner only in production)
 * @query   status, date (optional)
 */
router.get('/owner/:ownerId', getBookingsByOwner);

// ===========================================
// CRUD Routes
// ===========================================

/**
 * @route   POST /api/v1/bookings
 * @desc    Create a new booking request
 * @access  Public (Farmer only in production)
 */
router.post('/', createBooking);

/**
 * @route   GET /api/v1/bookings
 * @desc    Get all bookings with filters
 * @access  Public (Admin in production)
 * @query   status, date, farmer, owner, machine, page, limit
 */
router.get('/', getAllBookings);

/**
 * @route   GET /api/v1/bookings/:id
 * @desc    Get single booking by ID
 * @access  Public
 */
router.get('/:id', getBookingById);

/**
 * @route   PUT /api/v1/bookings/:id
 * @desc    Update booking details
 * @access  Public (Farmer only in production)
 */
router.put('/:id', updateBooking);

// ===========================================
// Status Update Routes
// ===========================================

/**
 * @route   PATCH /api/v1/bookings/:id/cancel
 * @desc    Cancel a booking
 * @access  Public
 * @body    reason (optional)
 */
router.patch('/:id/cancel', cancelBooking);

/**
 * @route   PATCH /api/v1/bookings/:id/confirm
 * @desc    Confirm a pending booking
 * @access  Public (Owner only in production)
 */
router.patch('/:id/confirm', confirmBooking);

/**
 * @route   PATCH /api/v1/bookings/:id/complete
 * @desc    Mark booking as completed with optional review
 * @access  Public
 * @body    rating (1-5), comment (optional)
 */
router.patch('/:id/complete', completeBooking);

module.exports = router;
