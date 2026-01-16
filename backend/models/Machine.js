/**
 * Machine Model
 * 
 * Defines the schema for farm machinery in the AgroShare platform.
 * Machines can be listed by owners and booked by farmers.
 */

const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
    // Machine name/title
    name: {
        type: String,
        required: [true, 'Machine name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    
    // Type of machinery
    type: {
        type: String,
        required: [true, 'Machine type is required'],
        enum: {
            values: [
                'tractor',
                'harvester',
                'rotavator',
                'seed_drill',
                'sprayer',
                'thresher',
                'cultivator',
                'plough',
                'water_pump',
                'other'
            ],
            message: 'Invalid machine type'
        }
    },
    
    // Reference to the machine owner
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Machine owner is required']
    },
    
    // Machine description
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    
    // Machine specifications
    specifications: {
        brand: {
            type: String,
            trim: true
        },
        model: {
            type: String,
            trim: true
        },
        year: {
            type: Number,
            min: [1990, 'Year must be 1990 or later'],
            max: [new Date().getFullYear(), 'Year cannot be in the future']
        },
        horsepower: {
            type: Number,
            min: [0, 'Horsepower must be positive']
        },
        fuelType: {
            type: String,
            enum: ['diesel', 'petrol', 'electric', 'manual'],
            default: 'diesel'
        }
    },
    
    // Machine location (where it's based)
    location: {
        village: {
            type: String,
            trim: true,
            required: [true, 'Village is required']
        },
        district: {
            type: String,
            trim: true,
            required: [true, 'District is required']
        },
        state: {
            type: String,
            trim: true,
            required: [true, 'State is required']
        },
        // GPS coordinates for distance calculations
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
    
    // Pricing information
    pricing: {
        // Rate per acre
        ratePerAcre: {
            type: Number,
            required: [true, 'Rate per acre is required'],
            min: [0, 'Rate must be positive']
        },
        // Minimum acres per booking
        minimumAcres: {
            type: Number,
            default: 1,
            min: [0.5, 'Minimum acres must be at least 0.5']
        },
        // Additional travel charge per km
        travelChargePerKm: {
            type: Number,
            default: 0,
            min: [0, 'Travel charge must be positive']
        }
    },
    
    // Availability settings
    availability: {
        // Is the machine currently available for booking?
        isAvailable: {
            type: Boolean,
            default: true
        },
        // Working hours
        workingHoursStart: {
            type: Number,
            default: 8, // 8 AM
            min: 0,
            max: 23
        },
        workingHoursEnd: {
            type: Number,
            default: 18, // 6 PM
            min: 0,
            max: 23
        },
        // Time required per acre (in minutes)
        timePerAcre: {
            type: Number,
            default: 60, // 1 hour per acre
            min: [15, 'Time per acre must be at least 15 minutes']
        },
        // Days of week when available (0 = Sunday, 6 = Saturday)
        availableDays: {
            type: [Number],
            default: [1, 2, 3, 4, 5, 6], // Monday to Saturday
            validate: {
                validator: function(arr) {
                    return arr.every(day => day >= 0 && day <= 6);
                },
                message: 'Available days must be between 0 and 6'
            }
        }
    },
    
    // Capacity - acres that can be processed per day
    dailyCapacityAcres: {
        type: Number,
        default: 10,
        min: [1, 'Daily capacity must be at least 1 acre']
    },
    
    // Machine status
    status: {
        type: String,
        enum: ['active', 'maintenance', 'inactive'],
        default: 'active'
    },
    
    // Average rating (updated via bookings)
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// ===========================================
// Virtual Properties
// ===========================================

// Get working hours duration
machineSchema.virtual('workingHoursDuration').get(function() {
    return this.availability.workingHoursEnd - this.availability.workingHoursStart;
});

// ===========================================
// Instance Methods
// ===========================================

/**
 * Calculate estimated cost for given acres
 * @param {number} acres - Number of acres
 * @param {number} distanceKm - Distance in kilometers (optional)
 * @returns {number} - Estimated total cost
 */
machineSchema.methods.calculateCost = function(acres, distanceKm = 0) {
    const baseCost = acres * this.pricing.ratePerAcre;
    const travelCost = distanceKm * this.pricing.travelChargePerKm;
    return Math.round(baseCost + travelCost);
};

/**
 * Calculate estimated time required for given acres
 * @param {number} acres - Number of acres
 * @returns {number} - Time in minutes
 */
machineSchema.methods.calculateTimeRequired = function(acres) {
    return Math.ceil(acres * this.availability.timePerAcre);
};

/**
 * Check if machine is available on a specific day
 * @param {Date} date - Date to check
 * @returns {boolean} - True if available
 */
machineSchema.methods.isAvailableOnDay = function(date) {
    const dayOfWeek = date.getDay();
    return this.availability.availableDays.includes(dayOfWeek) && 
           this.availability.isAvailable &&
           this.status === 'active';
};

// ===========================================
// Indexes
// ===========================================

// Create indexes for frequently queried fields
machineSchema.index({ type: 1 });
machineSchema.index({ owner: 1 });
machineSchema.index({ status: 1 });
machineSchema.index({ 'location.district': 1 });
machineSchema.index({ 'availability.isAvailable': 1 });
machineSchema.index({ 'pricing.ratePerAcre': 1 });

const Machine = mongoose.model('Machine', machineSchema);

module.exports = Machine;
