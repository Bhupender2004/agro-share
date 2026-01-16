/**
 * User Model
 * 
 * Defines the schema for users in the AgroShare platform.
 * Supports three roles: farmer, owner (machine owner), and admin.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // User's full name
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    
    // Unique email for authentication
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    
    // Hashed password
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },
    
    // User's phone number
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    
    // User role in the platform
    role: {
        type: String,
        enum: {
            values: ['farmer', 'owner', 'admin'],
            message: 'Role must be farmer, owner, or admin'
        },
        default: 'farmer'
    },
    
    // User's location (for proximity-based matching)
    location: {
        village: {
            type: String,
            trim: true
        },
        district: {
            type: String,
            trim: true
        },
        state: {
            type: String,
            trim: true
        },
        // GPS coordinates for precise location
        coordinates: {
            latitude: {
                type: Number,
                min: -90,
                max: 90
            },
            longitude: {
                type: Number,
                min: -180,
                max: 180
            }
        }
    },
    
    // Account status
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// ===========================================
// Middleware
// ===========================================

// Hash password before saving
userSchema.pre('save', async function(next) {
    // Only hash if password is modified
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// ===========================================
// Instance Methods
// ===========================================

/**
 * Compare entered password with hashed password
 * @param {string} enteredPassword - Plain text password to compare
 * @returns {Promise<boolean>} - True if passwords match
 */
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Get public user data (exclude sensitive fields)
 * @returns {Object} - User object without sensitive data
 */
userSchema.methods.toPublicJSON = function() {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        phone: this.phone,
        role: this.role,
        location: this.location,
        isActive: this.isActive,
        createdAt: this.createdAt
    };
};

// ===========================================
// Indexes
// ===========================================

// Create indexes for frequently queried fields
userSchema.index({ role: 1 });
userSchema.index({ 'location.district': 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
