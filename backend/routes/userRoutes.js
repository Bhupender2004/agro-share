/**
 * User Routes
 * 
 * API endpoints for user management
 */

const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    deleteUser
} = require('../controllers/userController');

// ===========================================
// Public Routes
// ===========================================

/**
 * @route   POST /api/v1/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/v1/users/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginUser);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users (with optional filters)
 * @access  Public (Admin in production)
 */
router.get('/', getAllUsers);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user profile by ID
 * @access  Public
 */
router.get('/:id', getUserProfile);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user profile
 * @access  Public (Protected in production)
 */
router.put('/:id', updateUserProfile);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Public (Admin in production)
 */
router.delete('/:id', deleteUser);

module.exports = router;
