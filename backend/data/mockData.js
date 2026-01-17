/**
 * Mock Data for In-Memory Storage
 * Used when MongoDB is not available
 */

const bcrypt = require('bcryptjs');

// Generate unique IDs
let userIdCounter = 1;
let machineIdCounter = 1;
let bookingIdCounter = 1;

const generateId = (prefix) => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}`;
};

// Sample Users
const users = [
    {
        _id: generateId('user'),
        name: 'Rajesh Kumar',
        email: 'rajesh@farmer.com',
        password: '$2a$10$8KzY2pZpxH5F5q5U5v5B5e5J5K5L5M5N5O5P5Q5R5S5T5U5V5W5X5Y',
        phone: '9876543210',
        role: 'farmer',
        location: {
            village: 'Rampur',
            district: 'Ludhiana',
            state: 'Punjab',
            coordinates: { lat: 30.9010, lng: 75.8573 }
        },
        isActive: true,
        createdAt: new Date('2024-01-15')
    },
    {
        _id: generateId('user'),
        name: 'Suresh Singh',
        email: 'suresh@owner.com',
        password: '$2a$10$8KzY2pZpxH5F5q5U5v5B5e5J5K5L5M5N5O5P5Q5R5S5T5U5V5W5X5Y',
        phone: '9876543211',
        role: 'owner',
        location: {
            village: 'Khanna',
            district: 'Ludhiana',
            state: 'Punjab',
            coordinates: { lat: 30.7046, lng: 76.2166 }
        },
        isActive: true,
        createdAt: new Date('2024-01-10')
    },
    {
        _id: generateId('user'),
        name: 'Admin User',
        email: 'admin@agroshare.com',
        password: '$2a$10$8KzY2pZpxH5F5q5U5v5B5e5J5K5L5M5N5O5P5Q5R5S5T5U5V5W5X5Y',
        phone: '9876543200',
        role: 'admin',
        location: {
            village: 'Central',
            district: 'Ludhiana',
            state: 'Punjab'
        },
        isActive: true,
        createdAt: new Date('2024-01-01')
    }
];

// Sample Machines
const machines = [
    {
        _id: generateId('machine'),
        name: 'John Deere Combine Harvester',
        type: 'harvester',
        owner: users[1]._id,
        description: 'Modern combine harvester suitable for wheat and rice harvesting. High efficiency with low grain loss.',
        specifications: {
            brand: 'John Deere',
            model: 'S780',
            year: 2022,
            horsepower: 473,
            fuelType: 'diesel',
            cuttingWidth: 12
        },
        location: {
            village: 'Khanna',
            district: 'Ludhiana',
            state: 'Punjab',
            coordinates: { lat: 30.7046, lng: 76.2166 }
        },
        pricing: {
            ratePerAcre: 1200,
            ratePerHour: 2500,
            minimumAcres: 5,
            transportChargePerKm: 50
        },
        availability: {
            isAvailable: true,
            availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
            workingHours: { start: '06:00', end: '18:00' }
        },
        dailyCapacityAcres: 25,
        status: 'active',
        images: ['https://images.unsplash.com/photo-1605002990847-6bb6e00e2c0f?w=800'],
        averageRating: 4.5,
        totalBookings: 45,
        createdAt: new Date('2024-02-01')
    },
    {
        _id: generateId('machine'),
        name: 'Mahindra Rotavator',
        type: 'rotavator',
        owner: users[1]._id,
        description: 'Heavy duty rotavator for soil preparation. Perfect for pre-sowing field preparation.',
        specifications: {
            brand: 'Mahindra',
            model: 'Gyrovator',
            year: 2023,
            horsepower: 55,
            fuelType: 'diesel',
            workingWidth: 7
        },
        location: {
            village: 'Khanna',
            district: 'Ludhiana',
            state: 'Punjab',
            coordinates: { lat: 30.7046, lng: 76.2166 }
        },
        pricing: {
            ratePerAcre: 800,
            ratePerHour: 1500,
            minimumAcres: 2,
            transportChargePerKm: 30
        },
        availability: {
            isAvailable: true,
            availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            workingHours: { start: '05:00', end: '19:00' }
        },
        dailyCapacityAcres: 15,
        status: 'active',
        images: ['https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=800'],
        averageRating: 4.2,
        totalBookings: 67,
        createdAt: new Date('2024-02-15')
    },
    {
        _id: generateId('machine'),
        name: 'TAFE Tractor with Cultivator',
        type: 'cultivator',
        owner: users[1]._id,
        description: '45 HP tractor with cultivator attachment. Ideal for inter-cultivation and weed control.',
        specifications: {
            brand: 'TAFE',
            model: '45 DI',
            year: 2021,
            horsepower: 45,
            fuelType: 'diesel',
            workingWidth: 5
        },
        location: {
            village: 'Jagraon',
            district: 'Ludhiana',
            state: 'Punjab',
            coordinates: { lat: 30.7877, lng: 75.4791 }
        },
        pricing: {
            ratePerAcre: 600,
            ratePerHour: 1000,
            minimumAcres: 1,
            transportChargePerKm: 25
        },
        availability: {
            isAvailable: true,
            availableDays: ['monday', 'tuesday', 'wednesday', 'friday', 'saturday'],
            workingHours: { start: '06:00', end: '17:00' }
        },
        dailyCapacityAcres: 12,
        status: 'active',
        images: ['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800'],
        averageRating: 4.0,
        totalBookings: 38,
        createdAt: new Date('2024-03-01')
    },
    {
        _id: generateId('machine'),
        name: 'Spray Master Boom Sprayer',
        type: 'sprayer',
        owner: users[1]._id,
        description: 'High capacity boom sprayer for pesticide and fertilizer application. 500L tank capacity.',
        specifications: {
            brand: 'Spray Master',
            model: 'Pro 500',
            year: 2023,
            tankCapacity: 500,
            boomWidth: 12,
            pumpPressure: 20
        },
        location: {
            village: 'Moga',
            district: 'Moga',
            state: 'Punjab',
            coordinates: { lat: 30.8170, lng: 75.1742 }
        },
        pricing: {
            ratePerAcre: 400,
            ratePerHour: 800,
            minimumAcres: 3,
            transportChargePerKm: 20
        },
        availability: {
            isAvailable: true,
            availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            workingHours: { start: '05:00', end: '10:00' }
        },
        dailyCapacityAcres: 30,
        status: 'active',
        images: ['https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800'],
        averageRating: 4.7,
        totalBookings: 89,
        createdAt: new Date('2024-03-15')
    },
    {
        _id: generateId('machine'),
        name: 'Seed Drill Planter',
        type: 'seeder',
        owner: users[1]._id,
        description: 'Precision seed drill for wheat, barley, and other row crops. Ensures uniform seed placement.',
        specifications: {
            brand: 'Dasmesh',
            model: 'Super Seeder',
            year: 2022,
            rowSpacing: 9,
            numberOfRows: 11,
            seedCapacity: 200
        },
        location: {
            village: 'Barnala',
            district: 'Barnala',
            state: 'Punjab',
            coordinates: { lat: 30.3814, lng: 75.5482 }
        },
        pricing: {
            ratePerAcre: 700,
            ratePerHour: 1200,
            minimumAcres: 2,
            transportChargePerKm: 35
        },
        availability: {
            isAvailable: true,
            availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
            workingHours: { start: '06:00', end: '16:00' }
        },
        dailyCapacityAcres: 18,
        status: 'active',
        images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800'],
        averageRating: 4.3,
        totalBookings: 52,
        createdAt: new Date('2024-04-01')
    },
    {
        _id: generateId('machine'),
        name: 'Laser Land Leveler',
        type: 'leveler',
        owner: users[1]._id,
        description: 'GPS-guided laser land leveler for precision field leveling. Improves water efficiency.',
        specifications: {
            brand: 'Trimble',
            model: 'LL500',
            year: 2023,
            accuracy: 2,
            bladeWidth: 3.5,
            laserRange: 700
        },
        location: {
            village: 'Sangrur',
            district: 'Sangrur',
            state: 'Punjab',
            coordinates: { lat: 30.2331, lng: 75.8441 }
        },
        pricing: {
            ratePerAcre: 1500,
            ratePerHour: 3000,
            minimumAcres: 5,
            transportChargePerKm: 60
        },
        availability: {
            isAvailable: true,
            availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            workingHours: { start: '07:00', end: '17:00' }
        },
        dailyCapacityAcres: 8,
        status: 'active',
        images: ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800'],
        averageRating: 4.8,
        totalBookings: 28,
        createdAt: new Date('2024-04-15')
    }
];

// Sample Bookings
const bookings = [
    {
        _id: generateId('booking'),
        farmer: users[0]._id,
        machine: machines[0]._id,
        owner: users[1]._id,
        date: new Date('2026-01-20'),
        fieldLocation: {
            village: 'Rampur',
            district: 'Ludhiana',
            coordinates: { lat: 30.9010, lng: 75.8573 }
        },
        acres: 10,
        workType: 'harvesting',
        status: 'confirmed',
        cost: {
            baseCost: 12000,
            travelCost: 500,
            totalCost: 12500
        },
        estimatedDuration: 240,
        priority: 2,
        createdAt: new Date('2026-01-15')
    },
    {
        _id: generateId('booking'),
        farmer: users[0]._id,
        machine: machines[1]._id,
        owner: users[1]._id,
        date: new Date('2026-01-22'),
        fieldLocation: {
            village: 'Rampur',
            district: 'Ludhiana',
            coordinates: { lat: 30.9010, lng: 75.8573 }
        },
        acres: 5,
        workType: 'tilling',
        status: 'pending',
        cost: {
            baseCost: 4000,
            travelCost: 300,
            totalCost: 4300
        },
        estimatedDuration: 180,
        priority: 1,
        createdAt: new Date('2026-01-16')
    }
];

// Helper function to populate owner in machine
const populateMachineOwner = (machine) => {
    const owner = users.find(u => u._id === machine.owner);
    return {
        ...machine,
        owner: owner ? {
            _id: owner._id,
            name: owner.name,
            email: owner.email,
            phone: owner.phone,
            location: owner.location
        } : null
    };
};

// Helper function to populate booking references
const populateBooking = (booking) => {
    const farmer = users.find(u => u._id === booking.farmer);
    const owner = users.find(u => u._id === booking.owner);
    const machine = machines.find(m => m._id === booking.machine);
    
    return {
        ...booking,
        farmer: farmer ? { _id: farmer._id, name: farmer.name, email: farmer.email, phone: farmer.phone } : null,
        owner: owner ? { _id: owner._id, name: owner.name, email: owner.email, phone: owner.phone } : null,
        machine: machine ? { _id: machine._id, name: machine.name, type: machine.type, pricing: machine.pricing } : null
    };
};

module.exports = {
    users,
    machines,
    bookings,
    generateId,
    populateMachineOwner,
    populateBooking
};
