/**
 * Routes Index
 * 
 * Central export for all routes
 */

const userRoutes = require('./userRoutes');
const machineRoutes = require('./machineRoutes');
const bookingRoutes = require('./bookingRoutes');

module.exports = {
    userRoutes,
    machineRoutes,
    bookingRoutes
};
