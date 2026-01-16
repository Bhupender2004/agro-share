/**
 * Booking Controller
 * 
 * Handles booking requests, scheduling, and booking management
 */

const Booking = require('../models/Booking');
const Machine = require('../models/Machine');
const User = require('../models/User');
const scheduler = require('../algorithms/scheduler');

/**
 * @desc    Create a new booking request
 * @route   POST /api/v1/bookings
 * @access  Public (would be farmer only in production)
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
        const farmerUser = await User.findById(farmer);
        if (!farmerUser) {
            return res.status(404).json({
                success: false,
                message: 'Farmer not found'
            });
        }
        
        // Validate machine exists and is available
        const machineDoc = await Machine.findById(machine).populate('owner');
        if (!machineDoc) {
            return res.status(404).json({
                success: false,
                message: 'Machine not found'
            });
        }
        
        if (!machineDoc.availability.isAvailable || machineDoc.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Machine is not available for booking'
            });
        }
        
        // Check if machine is available on the requested day
        const bookingDate = new Date(date);
        if (!machineDoc.isAvailableOnDay(bookingDate)) {
            return res.status(400).json({
                success: false,
                message: 'Machine is not available on the requested day'
            });
        }
        
        // Check minimum acres requirement
        if (acres < machineDoc.pricing.minimumAcres) {
            return res.status(400).json({
                success: false,
                message: `Minimum booking is ${machineDoc.pricing.minimumAcres} acres`
            });
        }
        
        // Calculate cost
        const baseCost = machineDoc.calculateCost(acres);
        const estimatedDuration = machineDoc.calculateTimeRequired(acres);
        
        // Create booking
        const booking = await Booking.create({
            farmer,
            machine,
            owner: machineDoc.owner._id,
            date: bookingDate,
            fieldLocation,
            acres,
            workType: workType || 'other',
            priority: priority || 1,
            notes,
            cost: {
                baseCost,
                travelCost: 0,
                totalCost: baseCost
            },
            estimatedDuration
        });
        
        // Populate references
        await booking.populate([
            { path: 'farmer', select: 'name email phone' },
            { path: 'machine', select: 'name type pricing' },
            { path: 'owner', select: 'name email phone' }
        ]);
        
        res.status(201).json({
            success: true,
            message: 'Booking request created successfully',
            data: booking
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all bookings
 * @route   GET /api/v1/bookings
 * @access  Public
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
        
        // Build query
        const query = {};
        
        if (status) query.status = status;
        if (farmer) query.farmer = farmer;
        if (owner) query.owner = owner;
        if (machine) query.machine = machine;
        
        // Date filter
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }
        
        // Pagination
        const skip = (page - 1) * limit;
        
        const bookings = await Booking.find(query)
            .populate('farmer', 'name email phone')
            .populate('machine', 'name type pricing location')
            .populate('owner', 'name email phone')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ date: 1, 'timeSlots.slotOrder': 1 });
        
        const total = await Booking.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: bookings.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: bookings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single booking
 * @route   GET /api/v1/bookings/:id
 * @access  Public
 */
const getBookingById = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('farmer', 'name email phone location')
            .populate('machine', 'name type pricing location availability')
            .populate('owner', 'name email phone');
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update booking
 * @route   PUT /api/v1/bookings/:id
 * @access  Public
 */
const updateBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        // Can only update pending or confirmed bookings
        if (!['pending', 'confirmed'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot update booking with status: ' + booking.status
            });
        }
        
        // Fields that can be updated
        const allowedUpdates = ['date', 'fieldLocation', 'acres', 'workType', 'priority', 'notes'];
        
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                booking[field] = req.body[field];
            }
        });
        
        // Recalculate cost if acres changed
        if (req.body.acres) {
            const machine = await Machine.findById(booking.machine);
            if (machine) {
                booking.cost.baseCost = machine.calculateCost(req.body.acres);
                booking.cost.totalCost = booking.cost.baseCost + booking.cost.travelCost;
                booking.estimatedDuration = machine.calculateTimeRequired(req.body.acres);
            }
        }
        
        await booking.save();
        await booking.populate([
            { path: 'farmer', select: 'name email phone' },
            { path: 'machine', select: 'name type pricing' },
            { path: 'owner', select: 'name email phone' }
        ]);
        
        res.status(200).json({
            success: true,
            message: 'Booking updated successfully',
            data: booking
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Cancel booking
 * @route   PATCH /api/v1/bookings/:id/cancel
 * @access  Public
 */
const cancelBooking = async (req, res, next) => {
    try {
        const { reason } = req.body;
        
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        if (booking.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel a completed booking'
            });
        }
        
        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already cancelled'
            });
        }
        
        await booking.cancel(reason || 'Cancelled by user');
        
        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Confirm booking
 * @route   PATCH /api/v1/bookings/:id/confirm
 * @access  Public (would be owner only in production)
 */
const confirmBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        if (booking.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Only pending bookings can be confirmed'
            });
        }
        
        await booking.confirm();
        
        res.status(200).json({
            success: true,
            message: 'Booking confirmed successfully',
            data: booking
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Complete booking with optional review
 * @route   PATCH /api/v1/bookings/:id/complete
 * @access  Public
 */
const completeBooking = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        if (!['confirmed', 'in_progress'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: 'Only confirmed or in-progress bookings can be completed'
            });
        }
        
        await booking.complete(rating, comment);
        
        // Update machine rating if review provided
        if (rating) {
            const machine = await Machine.findById(booking.machine);
            if (machine) {
                const newCount = machine.rating.count + 1;
                const newAverage = ((machine.rating.average * machine.rating.count) + rating) / newCount;
                machine.rating.average = Math.round(newAverage * 10) / 10;
                machine.rating.count = newCount;
                await machine.save();
            }
        }
        
        res.status(200).json({
            success: true,
            message: 'Booking completed successfully',
            data: booking
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Auto-schedule bookings for a date
 * @route   POST /api/v1/bookings/schedule
 * @access  Public (would be admin/owner in production)
 */
const scheduleBookings = async (req, res, next) => {
    try {
        const { date, machineId } = req.body;
        
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }
        
        const scheduleDate = new Date(date);
        
        // Build query for pending bookings
        const query = {
            status: 'pending',
            'timeSlots.startTime': null
        };
        
        // Filter by date
        const startOfDay = new Date(scheduleDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(scheduleDate);
        endOfDay.setHours(23, 59, 59, 999);
        query.date = { $gte: startOfDay, $lte: endOfDay };
        
        // Optionally filter by machine
        if (machineId) {
            query.machine = machineId;
        }
        
        // Get pending bookings with populated data
        const pendingBookings = await Booking.find(query)
            .populate('machine')
            .populate('farmer', 'name location');
        
        if (pendingBookings.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No pending bookings to schedule',
                data: { scheduled: 0, bookings: [] }
            });
        }
        
        // Group bookings by machine
        const bookingsByMachine = {};
        pendingBookings.forEach(booking => {
            const machineIdStr = booking.machine._id.toString();
            if (!bookingsByMachine[machineIdStr]) {
                bookingsByMachine[machineIdStr] = {
                    machine: booking.machine,
                    bookings: []
                };
            }
            bookingsByMachine[machineIdStr].bookings.push(booking);
        });
        
        // Schedule each machine's bookings
        const scheduledBookings = [];
        
        for (const machineIdStr of Object.keys(bookingsByMachine)) {
            const { machine, bookings } = bookingsByMachine[machineIdStr];
            
            // Use scheduler algorithm to optimize time slots
            const scheduledSlots = scheduler.scheduleJobs(bookings, machine);
            
            // Update bookings with scheduled time slots
            for (const slot of scheduledSlots) {
                const booking = await Booking.findById(slot.bookingId);
                if (booking) {
                    booking.timeSlots = {
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        slotOrder: slot.order
                    };
                    booking.schedulingInfo = {
                        autoScheduled: true,
                        distanceFromPrevious: slot.distanceFromPrevious || 0,
                        scheduledAt: new Date()
                    };
                    booking.status = 'confirmed';
                    await booking.save();
                    
                    await booking.populate([
                        { path: 'farmer', select: 'name email phone' },
                        { path: 'machine', select: 'name type' }
                    ]);
                    
                    scheduledBookings.push(booking);
                }
            }
        }
        
        res.status(200).json({
            success: true,
            message: `Successfully scheduled ${scheduledBookings.length} bookings`,
            data: {
                scheduled: scheduledBookings.length,
                bookings: scheduledBookings
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get bookings by farmer
 * @route   GET /api/v1/bookings/farmer/:farmerId
 * @access  Public
 */
const getBookingsByFarmer = async (req, res, next) => {
    try {
        const { status } = req.query;
        
        const query = { farmer: req.params.farmerId };
        if (status) query.status = status;
        
        const bookings = await Booking.find(query)
            .populate('machine', 'name type pricing location')
            .populate('owner', 'name phone')
            .sort({ date: -1 });
        
        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get bookings by owner
 * @route   GET /api/v1/bookings/owner/:ownerId
 * @access  Public
 */
const getBookingsByOwner = async (req, res, next) => {
    try {
        const { status, date } = req.query;
        
        const query = { owner: req.params.ownerId };
        if (status) query.status = status;
        
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }
        
        const bookings = await Booking.find(query)
            .populate('farmer', 'name phone location')
            .populate('machine', 'name type')
            .sort({ date: 1, 'timeSlots.slotOrder': 1 });
        
        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get schedule for a machine on a date
 * @route   GET /api/v1/bookings/schedule/:machineId
 * @access  Public
 */
const getMachineSchedule = async (req, res, next) => {
    try {
        const { date } = req.query;
        
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }
        
        const scheduleDate = new Date(date);
        const bookings = await Booking.getBookingsForDate(req.params.machineId, scheduleDate);
        
        await Booking.populate(bookings, [
            { path: 'farmer', select: 'name phone' },
            { path: 'machine', select: 'name type availability' }
        ]);
        
        // Calculate remaining capacity
        const machine = await Machine.findById(req.params.machineId);
        let totalBookedAcres = 0;
        let totalBookedMinutes = 0;
        
        bookings.forEach(b => {
            totalBookedAcres += b.acres;
            totalBookedMinutes += b.estimatedDuration;
        });
        
        const remainingCapacityAcres = machine ? Math.max(0, machine.dailyCapacityAcres - totalBookedAcres) : 0;
        const workingMinutes = machine ? (machine.availability.workingHoursEnd - machine.availability.workingHoursStart) * 60 : 0;
        const remainingMinutes = Math.max(0, workingMinutes - totalBookedMinutes);
        
        res.status(200).json({
            success: true,
            date: scheduleDate.toISOString().split('T')[0],
            summary: {
                totalBookings: bookings.length,
                totalAcres: totalBookedAcres,
                totalMinutes: totalBookedMinutes,
                remainingCapacityAcres,
                remainingMinutes
            },
            data: bookings
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
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
};
