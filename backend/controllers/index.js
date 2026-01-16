/**
 * Controllers Index
 * 
 * Central export for all controllers
 */

const userController = require('./userController');
const machineController = require('./machineController');
const bookingController = require('./bookingController');

module.exports = {
    userController,
    machineController,
    bookingController
};
