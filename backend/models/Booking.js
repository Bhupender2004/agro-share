/**
 * Booking Model
 * 
 * Defines the schema for machinery bookings in the AgroShare platform.
 * Tracks booking requests from farmers to use machines.
 */

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    // Reference to the farmer who made the booking
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Farmer is required']
    },
    
    // Reference to the booked machine
    machine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
        required: [true, 'Machine is required']
    },
    
    // Reference to the machine owner (denormalized for quick access)
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Owner is required']
    },
    
    // Booking date
    date: {
        type: Date,
        required: [true, 'Booking date is required'],
        validate: {
            validator: function(date) {
                // Booking date must be today or in the future
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date >= today;
            },
            message: 'Booking date must be today or in the future'
        }
    },
    
    // Assigned time slots (set by scheduler)
    timeSlots: {
        startTime: {
            type: String, // Format: "HH:MM" (24-hour)
            default: null
        },
        endTime: {
            type: String, // Format: "HH:MM" (24-hour)
            default: null
        },
        // Slot position in the day's schedule (for ordering)
        slotOrder: {
            type: Number,
            default: 0
        }
    },
    
    // Field/Farm location where work needs to be done
    fieldLocation: {
        village: {
            type: String,
            trim: true,
            required: [true, 'Field village is required']
        },
        district: {
            type: String,
            trim: true,
            required: [true, 'Field district is required']
        },
        state: {
            type: String,
            trim: true
        },
        // GPS coordinates for location-based scheduling
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
        },
        // Landmark for easy identification
        landmark: {
            type: String,
            trim: true
        }
    },
    
    // Area to be covered
    acres: {
        type: Number,
        required: [true, 'Number of acres is required'],
        min: [0.5, 'Minimum booking is 0.5 acres']
    },
    
    // Work type/purpose
    workType: {
        type: String,
        enum: [
            'ploughing',
            'sowing',
            'harvesting',
            'spraying',
            'threshing',
            'irrigation',
            'other'
        ],
        default: 'other'
    },
    
    // Cost breakdown
    cost: {
        // Base cost (acres × rate per acre)
        baseCost: {
            type: Number,
            required: true,
            min: 0
        },
        // Travel/transport cost
        travelCost: {
            type: Number,
            default: 0,
            min: 0
        },
        // Total cost
        totalCost: {
            type: Number,
            required: true,
            min: 0
        }
    },
    
    // Estimated time in minutes
    estimatedDuration: {
        type: Number, // Duration in minutes
        required: true
    },
    
    // Booking status
    status: {
        type: String,
        enum: {
            values: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
            message: 'Invalid booking status'
        },
        default: 'pending'
    },
    
    // Priority level for scheduling
    priority: {
        type: Number,
        default: 1, // 1 = normal, 2 = high, 3 = urgent
        min: 1,
        max: 3
    },
    
    // Cancellation reason (if cancelled)
    cancellationReason: {
        type: String,
        trim: true
    },
    
    // Notes/special instructions
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    
    // Rating and review (after completion)
    review: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            trim: true,
            maxlength: [500, 'Review cannot exceed 500 characters']
        },
        reviewedAt: {
            type: Date
        }
    },
    
    // Scheduling metadata
    schedulingInfo: {
        // Was this auto-scheduled?
        autoScheduled: {
            type: Boolean,
            default: false
        },
        // Distance from previous job in the schedule (km)
        distanceFromPrevious: {
            type: Number,
            default: 0
        },
        // Scheduling timestamp
        scheduledAt: {
            type: Date
        }
    }
}, {
    timestamps: true
});

// ===========================================
// Virtual Properties
// ===========================================

// Get booking duration in hours
bookingSchema.virtual('durationHours').get(function() {
    return Math.round(this.estimatedDuration / 60 * 10) / 10; // Round to 1 decimal
});

// Check if booking is editable
bookingSchema.virtual('isEditable').get(function() {
    return ['pending', 'confirmed'].includes(this.status);
});

// ===========================================
// Pre-save Middleware
// ===========================================

bookingSchema.pre('save', function(next) {
    // Calculate total cost if not set
    if (this.cost.baseCost && !this.cost.totalCost) {
        this.cost.totalCost = this.cost.baseCost + (this.cost.travelCost || 0);
    }
    next();
});

// ===========================================
// Static Methods
// ===========================================

/**
 * Get all bookings for a specific date and machine
 * @param {ObjectId} machineId - Machine ID
 * @param {Date} date - Booking date
 * @returns {Promise<Array>} - Array of bookings
 */
bookingSchema.statics.getBookingsForDate = async function(machineId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return await this.find({
        machine: machineId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $nin: ['cancelled'] }
    }).sort({ 'timeSlots.slotOrder': 1 });
};

/**
 * Get pending bookings for scheduling
 * @param {Date} date - Date to schedule
 * @returns {Promise<Array>} - Array of pending bookings
 */
bookingSchema.statics.getPendingBookingsForDate = async function(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return await this.find({
        date: { $gte: startOfDay, $lte: endOfDay },
        status: 'pending',
        'timeSlots.startTime': null
    }).populate('machine farmer');
};

// ===========================================
// Instance Methods
// ===========================================

/**
 * Confirm the booking
 * @returns {Promise<Booking>} - Updated booking
 */
bookingSchema.methods.confirm = async function() {
    this.status = 'confirmed';
    return await this.save();
};

/**
 * Cancel the booking
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Booking>} - Updated booking
 */
bookingSchema.methods.cancel = async function(reason) {
    this.status = 'cancelled';
    this.cancellationReason = reason;
    return await this.save();
};

/**
 * Mark booking as completed and add review
 * @param {number} rating - Rating (1-5)
 * @param {string} comment - Review comment
 * @returns {Promise<Booking>} - Updated booking
 */
bookingSchema.methods.complete = async function(rating, comment) {
    this.status = 'completed';
    if (rating) {
        this.review = {
            rating,
            comment,
            reviewedAt: new Date()
        };
    }
    return await this.save();
};

// ===========================================
// Indexes
// ===========================================

// Create indexes for frequently queried fields
bookingSchema.index({ farmer: 1, date: 1 });
bookingSchema.index({ machine: 1, date: 1 });
bookingSchema.index({ owner: 1, date: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ date: 1 });
bookingSchema.index({ 'fieldLocation.district': 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
