/**
 * Machine Routes
 * 
 * API endpoints for farm machinery management
 */

const express = require('express');
const router = express.Router();
const {
    addMachine,
    getAllMachines,
    getMachineById,
    updateMachine,
    deleteMachine,
    getMachinesByOwner,
    updateMachineAvailability,
    searchNearbyMachines
} = require('../controllers/machineController');

// ===========================================
// Machine Routes
// ===========================================

/**
 * @route   GET /api/v1/machines/search/nearby
 * @desc    Search for nearby machines by GPS coordinates
 * @access  Public
 * @query   latitude, longitude, radius (km), type
 */
router.get('/search/nearby', searchNearbyMachines);

/**
 * @route   GET /api/v1/machines/owner/:ownerId
 * @desc    Get all machines by a specific owner
 * @access  Public
 */
router.get('/owner/:ownerId', getMachinesByOwner);

/**
 * @route   POST /api/v1/machines
 * @desc    Add a new machine
 * @access  Public (Owner only in production)
 */
router.post('/', addMachine);

/**
 * @route   GET /api/v1/machines
 * @desc    Get all machines with filters
 * @access  Public
 * @query   type, district, minRate, maxRate, available, page, limit, sortBy, order
 */
router.get('/', getAllMachines);

/**
 * @route   GET /api/v1/machines/:id
 * @desc    Get single machine by ID
 * @access  Public
 */
router.get('/:id', getMachineById);

/**
 * @route   PUT /api/v1/machines/:id
 * @desc    Update machine details
 * @access  Public (Owner only in production)
 */
router.put('/:id', updateMachine);

/**
 * @route   DELETE /api/v1/machines/:id
 * @desc    Delete machine
 * @access  Public (Owner only in production)
 */
router.delete('/:id', deleteMachine);

/**
 * @route   PATCH /api/v1/machines/:id/availability
 * @desc    Update machine availability settings
 * @access  Public (Owner only in production)
 */
router.patch('/:id/availability', updateMachineAvailability);

module.exports = router;
