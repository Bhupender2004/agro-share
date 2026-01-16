/**
 * Models Index
 * 
 * Central export for all Mongoose models
 */

const User = require('./User');
const Machine = require('./Machine');
const Booking = require('./Booking');

module.exports = {
    User,
    Machine,
    Booking
};
