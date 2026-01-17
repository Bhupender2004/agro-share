/**
 * Mock User Controller
 * In-memory implementation when MongoDB is not available
 */

const bcrypt = require('bcryptjs');
const { users, generateId } = require('../../data/mockData');

/**
 * @desc    Register a new user
 * @route   POST /api/v1/users/register
 */
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, phone, role, location } = req.body;
        
        // Check if user already exists
        const existingUser = users.find(u => u.email === email);
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
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = {
            _id: generateId('user'),
            name,
            email,
            password: hashedPassword,
            phone,
            role: role || 'farmer',
            location: location || {},
            isActive: true,
            createdAt: new Date()
        };
        
        users.push(newUser);
        
        const { password: _, ...publicUser } = newUser;
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: publicUser
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/users/login
 */
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }
        
        const user = users.find(u => u.email === email);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact admin.'
            });
        }
        
        // For demo, accept any password or check hashed
        const isValidPassword = password === 'demo123' || await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        const { password: _, ...publicUser } = user;
        
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: publicUser
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get user profile
 * @route   GET /api/v1/users/:id
 */
const getUserProfile = async (req, res, next) => {
    try {
        const user = users.find(u => u._id === req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        const { password: _, ...publicUser } = user;
        
        res.status(200).json({
            success: true,
            data: publicUser
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/users/:id
 */
const updateUserProfile = async (req, res, next) => {
    try {
        const { name, phone, location } = req.body;
        
        const userIndex = users.findIndex(u => u._id === req.params.id);
        
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        if (name) users[userIndex].name = name;
        if (phone) users[userIndex].phone = phone;
        if (location) users[userIndex].location = { ...users[userIndex].location, ...location };
        
        const { password: _, ...publicUser } = users[userIndex];
        
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: publicUser
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 */
const getAllUsers = async (req, res, next) => {
    try {
        const { role, page = 1, limit = 10 } = req.query;
        
        let filteredUsers = [...users];
        
        if (role) {
            filteredUsers = filteredUsers.filter(u => u.role === role);
        }
        
        const skip = (page - 1) * limit;
        const paginatedUsers = filteredUsers.slice(skip, skip + parseInt(limit));
        
        const publicUsers = paginatedUsers.map(({ password, ...user }) => user);
        
        res.status(200).json({
            success: true,
            count: publicUsers.length,
            total: filteredUsers.length,
            totalPages: Math.ceil(filteredUsers.length / limit),
            currentPage: parseInt(page),
            data: publicUsers
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 */
const deleteUser = async (req, res, next) => {
    try {
        const userIndex = users.findIndex(u => u._id === req.params.id);
        
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        users.splice(userIndex, 1);
        
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
