/**
 * Machine Controller
 * 
 * Handles farm machinery CRUD operations and availability management
 */

const Machine = require('../models/Machine');
const User = require('../models/User');

/**
 * @desc    Add a new machine
 * @route   POST /api/v1/machines
 * @access  Public (would be owner only in production)
 */
const addMachine = async (req, res, next) => {
    try {
        const {
            name,
            type,
            owner,
            description,
            specifications,
            location,
            pricing,
            availability,
            dailyCapacityAcres
        } = req.body;
        
        // Verify owner exists and has owner role
        const ownerUser = await User.findById(owner);
        if (!ownerUser) {
            return res.status(404).json({
                success: false,
                message: 'Owner not found'
            });
        }
        
        if (ownerUser.role !== 'owner' && ownerUser.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: 'User must have owner role to add machines'
            });
        }
        
        // Create machine
        const machine = await Machine.create({
            name,
            type,
            owner,
            description,
            specifications,
            location,
            pricing,
            availability,
            dailyCapacityAcres
        });
        
        // Populate owner details
        await machine.populate('owner', 'name email phone');
        
        res.status(201).json({
            success: true,
            message: 'Machine added successfully',
            data: machine
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all machines
 * @route   GET /api/v1/machines
 * @access  Public
 */
const getAllMachines = async (req, res, next) => {
    try {
        const {
            type,
            district,
            minRate,
            maxRate,
            available,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;
        
        // Build query
        const query = { status: 'active' };
        
        if (type) query.type = type;
        if (district) query['location.district'] = new RegExp(district, 'i');
        if (available === 'true') query['availability.isAvailable'] = true;
        
        // Price range filter
        if (minRate || maxRate) {
            query['pricing.ratePerAcre'] = {};
            if (minRate) query['pricing.ratePerAcre'].$gte = parseFloat(minRate);
            if (maxRate) query['pricing.ratePerAcre'].$lte = parseFloat(maxRate);
        }
        
        // Pagination
        const skip = (page - 1) * limit;
        
        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = order === 'asc' ? 1 : -1;
        
        const machines = await Machine.find(query)
            .populate('owner', 'name email phone location')
            .skip(skip)
            .limit(parseInt(limit))
            .sort(sortOptions);
        
        const total = await Machine.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: machines.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: machines
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single machine by ID
 * @route   GET /api/v1/machines/:id
 * @access  Public
 */
const getMachineById = async (req, res, next) => {
    try {
        const machine = await Machine.findById(req.params.id)
            .populate('owner', 'name email phone location');
        
        if (!machine) {
            return res.status(404).json({
                success: false,
                message: 'Machine not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: machine
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update machine
 * @route   PUT /api/v1/machines/:id
 * @access  Public (would be owner only in production)
 */
const updateMachine = async (req, res, next) => {
    try {
        const machine = await Machine.findById(req.params.id);
        
        if (!machine) {
            return res.status(404).json({
                success: false,
                message: 'Machine not found'
            });
        }
        
        // Fields that can be updated
        const allowedUpdates = [
            'name', 'description', 'specifications', 'location',
            'pricing', 'availability', 'dailyCapacityAcres', 'status'
        ];
        
        // Apply updates
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                machine[field] = req.body[field];
            }
        });
        
        await machine.save();
        await machine.populate('owner', 'name email phone');
        
        res.status(200).json({
            success: true,
            message: 'Machine updated successfully',
            data: machine
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete machine
 * @route   DELETE /api/v1/machines/:id
 * @access  Public (would be owner only in production)
 */
const deleteMachine = async (req, res, next) => {
    try {
        const machine = await Machine.findByIdAndDelete(req.params.id);
        
        if (!machine) {
            return res.status(404).json({
                success: false,
                message: 'Machine not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Machine deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get machines by owner
 * @route   GET /api/v1/machines/owner/:ownerId
 * @access  Public
 */
const getMachinesByOwner = async (req, res, next) => {
    try {
        const machines = await Machine.find({ owner: req.params.ownerId })
            .populate('owner', 'name email phone')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: machines.length,
            data: machines
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update machine availability
 * @route   PATCH /api/v1/machines/:id/availability
 * @access  Public (would be owner only in production)
 */
const updateMachineAvailability = async (req, res, next) => {
    try {
        const { isAvailable, workingHoursStart, workingHoursEnd, availableDays } = req.body;
        
        const machine = await Machine.findById(req.params.id);
        
        if (!machine) {
            return res.status(404).json({
                success: false,
                message: 'Machine not found'
            });
        }
        
        // Update availability fields
        if (isAvailable !== undefined) machine.availability.isAvailable = isAvailable;
        if (workingHoursStart !== undefined) machine.availability.workingHoursStart = workingHoursStart;
        if (workingHoursEnd !== undefined) machine.availability.workingHoursEnd = workingHoursEnd;
        if (availableDays !== undefined) machine.availability.availableDays = availableDays;
        
        await machine.save();
        
        res.status(200).json({
            success: true,
            message: 'Availability updated successfully',
            data: {
                id: machine._id,
                availability: machine.availability
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Search machines by location proximity
 * @route   GET /api/v1/machines/search/nearby
 * @access  Public
 */
const searchNearbyMachines = async (req, res, next) => {
    try {
        const { latitude, longitude, radius = 50, type } = req.query;
        
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }
        
        // For simplicity, we're doing a basic distance filter
        // In production, use MongoDB's $geoNear for proper geospatial queries
        const query = {
            status: 'active',
            'availability.isAvailable': true
        };
        
        if (type) query.type = type;
        
        const machines = await Machine.find(query)
            .populate('owner', 'name email phone');
        
        // Calculate distance and filter (simplified Haversine formula)
        const lat1 = parseFloat(latitude);
        const lon1 = parseFloat(longitude);
        const maxRadius = parseFloat(radius);
        
        const nearbyMachines = machines.filter(machine => {
            if (!machine.location.coordinates?.latitude || !machine.location.coordinates?.longitude) {
                return false;
            }
            
            const lat2 = machine.location.coordinates.latitude;
            const lon2 = machine.location.coordinates.longitude;
            
            // Haversine formula
            const R = 6371; // Earth's radius in km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                      Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c;
            
            // Add distance to machine object
            machine._doc.distance = Math.round(distance * 10) / 10;
            
            return distance <= maxRadius;
        });
        
        // Sort by distance
        nearbyMachines.sort((a, b) => a._doc.distance - b._doc.distance);
        
        res.status(200).json({
            success: true,
            count: nearbyMachines.length,
            data: nearbyMachines
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addMachine,
    getAllMachines,
    getMachineById,
    updateMachine,
    deleteMachine,
    getMachinesByOwner,
    updateMachineAvailability,
    searchNearbyMachines
};
