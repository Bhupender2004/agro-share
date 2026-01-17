/**
 * Mock Booking Controller
 * In-memory implementation when MongoDB is not available
 */

const { bookings, machines, users, generateId, populateBooking } = require('../../data/mockData');

/**
 * @desc    Create a new booking request
 * @route   POST /api/v1/bookings
 */
const createBooking = async (req, res, next) => {
    try {
        const {
            farmer,
            machine,
            date,
            fieldLocation,
            acres,
            workType,
            priority,
            notes
        } = req.body;
        
        // Validate farmer exists
        const farmerUser = users.find(u => u._id === farmer);
        if (!farmerUser) {
            return res.status(404).json({
                success: false,
                message: 'Farmer not found'
            });
        }
        
        // Validate machine exists
        const machineDoc = machines.find(m => m._id === machine);
        if (!machineDoc) {
            return res.status(404).json({
                success: false,
                message: 'Machine not found'
            });
        }
        
        if (!machineDoc.availability?.isAvailable || machineDoc.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Machine is not available for booking'
            });
        }
        
        // Calculate cost
        const baseCost = (machineDoc.pricing?.ratePerAcre || 500) * acres;
        const estimatedDuration = Math.ceil(acres / (machineDoc.dailyCapacityAcres || 10) * 60);
        
        const newBooking = {
            _id: generateId('booking'),
            farmer,
            machine,
            owner: machineDoc.owner,
            date: new Date(date),
            fieldLocation: fieldLocation || {},
            acres,
            workType: workType || 'other',
            status: 'pending',
            cost: {
                baseCost,
                travelCost: 0,
                totalCost: baseCost
            },
            estimatedDuration,
            priority: priority || 1,
            notes,
            createdAt: new Date()
        };
        
        bookings.push(newBooking);
        
        res.status(201).json({
            success: true,
            message: 'Booking request created successfully',
            data: populateBooking(newBooking)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all bookings
 * @route   GET /api/v1/bookings
 */
const getAllBookings = async (req, res, next) => {
    try {
        const {
            status,
            date,
            farmer,
            owner,
            machine,
            page = 1,
            limit = 10
        } = req.query;
        
        let filteredBookings = [...bookings];
        
        if (status) filteredBookings = filteredBookings.filter(b => b.status === status);
        if (farmer) filteredBookings = filteredBookings.filter(b => b.farmer === farmer);
        if (owner) filteredBookings = filteredBookings.filter(b => b.owner === owner);
        if (machine) filteredBookings = filteredBookings.filter(b => b.machine === machine);
        
        if (date) {
            const filterDate = new Date(date).toDateString();
            filteredBookings = filteredBookings.filter(b => 
                new Date(b.date).toDateString() === filterDate
            );
        }
        
        // Sort by date
        filteredBookings.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const skip = (page - 1) * limit;
        const paginatedBookings = filteredBookings.slice(skip, skip + parseInt(limit));
        
        const populatedBookings = paginatedBookings.map(populateBooking);
        
        res.status(200).json({
            success: true,
            count: populatedBookings.length,
            total: filteredBookings.length,
            totalPages: Math.ceil(filteredBookings.length / limit),
            currentPage: parseInt(page),
            data: populatedBookings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single booking
 * @route   GET /api/v1/bookings/:id
 */
const getBookingById = async (req, res, next) => {
    try {
        const booking = bookings.find(b => b._id === req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: populateBooking(booking)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update booking status
 * @route   PATCH /api/v1/bookings/:id/status
 */
const updateBookingStatus = async (req, res, next) => {
    try {
        const { status, cancellationReason } = req.body;
        
        const bookingIndex = bookings.findIndex(b => b._id === req.params.id);
        
        if (bookingIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }
        
        bookings[bookingIndex].status = status;
        if (status === 'cancelled' && cancellationReason) {
            bookings[bookingIndex].cancellationReason = cancellationReason;
        }
        
        res.status(200).json({
            success: true,
            message: 'Booking status updated',
            data: populateBooking(bookings[bookingIndex])
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get bookings by farmer
 * @route   GET /api/v1/bookings/farmer/:farmerId
 */
const getBookingsByFarmer = async (req, res, next) => {
    try {
        const farmerBookings = bookings
            .filter(b => b.farmer === req.params.farmerId)
            .map(populateBooking);
        
        res.status(200).json({
            success: true,
            count: farmerBookings.length,
            data: farmerBookings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get bookings by owner
 * @route   GET /api/v1/bookings/owner/:ownerId
 */
const getBookingsByOwner = async (req, res, next) => {
    try {
        const ownerBookings = bookings
            .filter(b => b.owner === req.params.ownerId)
            .map(populateBooking);
        
        res.status(200).json({
            success: true,
            count: ownerBookings.length,
            data: ownerBookings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get bookings by machine
 * @route   GET /api/v1/bookings/machine/:machineId
 */
const getBookingsByMachine = async (req, res, next) => {
    try {
        const machineBookings = bookings
            .filter(b => b.machine === req.params.machineId)
            .map(populateBooking);
        
        res.status(200).json({
            success: true,
            count: machineBookings.length,
            data: machineBookings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Cancel booking
 * @route   DELETE /api/v1/bookings/:id
 */
const cancelBooking = async (req, res, next) => {
    try {
        const bookingIndex = bookings.findIndex(b => b._id === req.params.id);
        
        if (bookingIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        bookings[bookingIndex].status = 'cancelled';
        bookings[bookingIndex].cancellationReason = req.body.reason || 'Cancelled by user';
        
        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get optimized schedule
 * @route   POST /api/v1/bookings/schedule/optimize
 */
const getOptimizedSchedule = async (req, res, next) => {
    try {
        const { machineId, date } = req.body;
        
        const dateBookings = bookings.filter(b => {
            const bookingDate = new Date(b.date).toDateString();
            const targetDate = new Date(date).toDateString();
            return b.machine === machineId && bookingDate === targetDate;
        });
        
        // Simple schedule - just return sorted by priority
        const schedule = dateBookings
            .sort((a, b) => b.priority - a.priority)
            .map((b, index) => ({
                ...populateBooking(b),
                slotOrder: index + 1,
                startTime: `${6 + index * 2}:00`,
                endTime: `${8 + index * 2}:00`
            }));
        
        res.status(200).json({
            success: true,
            data: {
                date,
                machineId,
                totalBookings: schedule.length,
                schedule
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get schedule for a date
 * @route   GET /api/v1/bookings/schedule/:date
 */
const getScheduleByDate = async (req, res, next) => {
    try {
        const targetDate = new Date(req.params.date).toDateString();
        
        const dateBookings = bookings
            .filter(b => new Date(b.date).toDateString() === targetDate)
            .map(populateBooking);
        
        res.status(200).json({
            success: true,
            date: req.params.date,
            count: dateBookings.length,
            data: dateBookings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add rating to booking
 * @route   POST /api/v1/bookings/:id/rating
 */
const addRating = async (req, res, next) => {
    try {
        const { rating, review } = req.body;
        
        const bookingIndex = bookings.findIndex(b => b._id === req.params.id);
        
        if (bookingIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        bookings[bookingIndex].rating = {
            score: rating,
            review,
            ratedAt: new Date()
        };
        
        res.status(200).json({
            success: true,
            message: 'Rating added successfully',
            data: populateBooking(bookings[bookingIndex])
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBookingStatus,
    getBookingsByFarmer,
    getBookingsByOwner,
    getBookingsByMachine,
    cancelBooking,
    getOptimizedSchedule,
    getScheduleByDate,
    addRating
};
