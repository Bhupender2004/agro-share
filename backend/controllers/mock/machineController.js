/**
 * Mock Machine Controller
 * In-memory implementation when MongoDB is not available
 */

const { machines, users, generateId, populateMachineOwner } = require('../../data/mockData');

/**
 * @desc    Add a new machine
 * @route   POST /api/v1/machines
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
        
        // Verify owner exists
        const ownerUser = users.find(u => u._id === owner);
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
        
        const newMachine = {
            _id: generateId('machine'),
            name,
            type,
            owner,
            description,
            specifications: specifications || {},
            location: location || {},
            pricing: pricing || { ratePerAcre: 500, minimumAcres: 1 },
            availability: availability || { isAvailable: true, availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] },
            dailyCapacityAcres: dailyCapacityAcres || 10,
            status: 'active',
            images: [],
            averageRating: 0,
            totalBookings: 0,
            createdAt: new Date()
        };
        
        machines.push(newMachine);
        
        res.status(201).json({
            success: true,
            message: 'Machine added successfully',
            data: populateMachineOwner(newMachine)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all machines
 * @route   GET /api/v1/machines
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
        
        let filteredMachines = machines.filter(m => m.status === 'active');
        
        if (type) {
            filteredMachines = filteredMachines.filter(m => m.type === type);
        }
        
        if (district) {
            const districtLower = district.toLowerCase();
            filteredMachines = filteredMachines.filter(m => 
                m.location?.district?.toLowerCase().includes(districtLower)
            );
        }
        
        if (available === 'true') {
            filteredMachines = filteredMachines.filter(m => m.availability?.isAvailable);
        }
        
        if (minRate) {
            filteredMachines = filteredMachines.filter(m => 
                m.pricing?.ratePerAcre >= parseFloat(minRate)
            );
        }
        
        if (maxRate) {
            filteredMachines = filteredMachines.filter(m => 
                m.pricing?.ratePerAcre <= parseFloat(maxRate)
            );
        }
        
        // Sort
        filteredMachines.sort((a, b) => {
            const aVal = a[sortBy] || 0;
            const bVal = b[sortBy] || 0;
            return order === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
        });
        
        // Pagination
        const skip = (page - 1) * limit;
        const paginatedMachines = filteredMachines.slice(skip, skip + parseInt(limit));
        
        const populatedMachines = paginatedMachines.map(populateMachineOwner);
        
        res.status(200).json({
            success: true,
            count: populatedMachines.length,
            total: filteredMachines.length,
            totalPages: Math.ceil(filteredMachines.length / limit),
            currentPage: parseInt(page),
            data: populatedMachines
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single machine by ID
 * @route   GET /api/v1/machines/:id
 */
const getMachineById = async (req, res, next) => {
    try {
        const machine = machines.find(m => m._id === req.params.id);
        
        if (!machine) {
            return res.status(404).json({
                success: false,
                message: 'Machine not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: populateMachineOwner(machine)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update machine
 * @route   PUT /api/v1/machines/:id
 */
const updateMachine = async (req, res, next) => {
    try {
        const machineIndex = machines.findIndex(m => m._id === req.params.id);
        
        if (machineIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Machine not found'
            });
        }
        
        const allowedUpdates = ['name', 'description', 'specifications', 'pricing', 'availability', 'status', 'location'];
        
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                if (typeof req.body[field] === 'object' && machines[machineIndex][field]) {
                    machines[machineIndex][field] = { ...machines[machineIndex][field], ...req.body[field] };
                } else {
                    machines[machineIndex][field] = req.body[field];
                }
            }
        });
        
        res.status(200).json({
            success: true,
            message: 'Machine updated successfully',
            data: populateMachineOwner(machines[machineIndex])
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete machine
 * @route   DELETE /api/v1/machines/:id
 */
const deleteMachine = async (req, res, next) => {
    try {
        const machineIndex = machines.findIndex(m => m._id === req.params.id);
        
        if (machineIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Machine not found'
            });
        }
        
        // Soft delete
        machines[machineIndex].status = 'inactive';
        
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
 */
const getMachinesByOwner = async (req, res, next) => {
    try {
        const ownerMachines = machines.filter(m => m.owner === req.params.ownerId);
        
        const populatedMachines = ownerMachines.map(populateMachineOwner);
        
        res.status(200).json({
            success: true,
            count: populatedMachines.length,
            data: populatedMachines
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get machine types
 * @route   GET /api/v1/machines/types/all
 */
const getMachineTypes = async (req, res, next) => {
    try {
        const types = [...new Set(machines.map(m => m.type))];
        
        res.status(200).json({
            success: true,
            data: types
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update machine availability
 * @route   PATCH /api/v1/machines/:id/availability
 */
const updateAvailability = async (req, res, next) => {
    try {
        const machineIndex = machines.findIndex(m => m._id === req.params.id);
        
        if (machineIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Machine not found'
            });
        }
        
        machines[machineIndex].availability = {
            ...machines[machineIndex].availability,
            ...req.body
        };
        
        res.status(200).json({
            success: true,
            message: 'Availability updated successfully',
            data: populateMachineOwner(machines[machineIndex])
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Search machines nearby
 * @route   GET /api/v1/machines/nearby
 */
const getNearbyMachines = async (req, res, next) => {
    try {
        const { lat, lng, radius = 50 } = req.query;
        
        // For mock, just return all available machines
        const nearbyMachines = machines
            .filter(m => m.status === 'active' && m.availability?.isAvailable)
            .map(populateMachineOwner);
        
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
    getMachineTypes,
    updateAvailability,
    getNearbyMachines
};
