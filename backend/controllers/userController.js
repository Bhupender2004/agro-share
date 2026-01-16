/**
 * User Controller
 * 
 * Handles user registration, login, and profile management
 */

const User = require('../models/User');

/**
 * @desc    Register a new user
 * @route   POST /api/v1/users/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, phone, role, location } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        
        // Validate role
        const validRoles = ['farmer', 'owner', 'admin'];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be farmer, owner, or admin'
            });
        }
        
        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            role: role || 'farmer',
            location
        });
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: user.toPublicJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/users/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }
        
        // Find user by email (include password for comparison)
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact admin.'
            });
        }
        
        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Return user data (no JWT for now)
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: user.toPublicJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get user profile
 * @route   GET /api/v1/users/:id
 * @access  Public (would be protected in production)
 */
const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: user.toPublicJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/users/:id
 * @access  Public (would be protected in production)
 */
const updateUserProfile = async (req, res, next) => {
    try {
        const { name, phone, location } = req.body;
        
        // Fields that can be updated
        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (location) updateData.location = location;
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user.toPublicJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all users (admin only in production)
 * @route   GET /api/v1/users
 * @access  Public (would be admin only in production)
 */
const getAllUsers = async (req, res, next) => {
    try {
        const { role, district, page = 1, limit = 10 } = req.query;
        
        // Build query
        const query = {};
        if (role) query.role = role;
        if (district) query['location.district'] = district;
        
        // Pagination
        const skip = (page - 1) * limit;
        
        const users = await User.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });
        
        const total = await User.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: users.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: users.map(user => user.toPublicJSON())
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Public (would be admin only in production)
 */
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    deleteUser
};
