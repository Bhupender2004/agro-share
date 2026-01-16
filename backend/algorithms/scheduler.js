/**
 * Scheduler Algorithm
 * 
 * AI-driven scheduling algorithm for farm machinery bookings.
 * Optimizes job scheduling by:
 * 1. Sorting jobs by location to minimize travel distance
 * 2. Assigning sequential time slots starting from working hours
 * 3. Considering priority levels
 * 4. Minimizing idle travel time between jobs
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Object} coord1 - {latitude, longitude}
 * @param {Object} coord2 - {latitude, longitude}
 * @returns {number} - Distance in kilometers
 */
const calculateDistance = (coord1, coord2) => {
    if (!coord1?.latitude || !coord1?.longitude || !coord2?.latitude || !coord2?.longitude) {
        return 0;
    }
    
    const R = 6371; // Earth's radius in kilometers
    const lat1 = coord1.latitude * Math.PI / 180;
    const lat2 = coord2.latitude * Math.PI / 180;
    const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return Math.round(R * c * 10) / 10; // Round to 1 decimal place
};

/**
 * Format time from minutes since midnight to HH:MM format
 * @param {number} minutes - Minutes since midnight
 * @returns {string} - Time in HH:MM format
 */
const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Parse HH:MM time to minutes since midnight
 * @param {string} timeStr - Time in HH:MM format
 * @returns {number} - Minutes since midnight
 */
const parseTime = (timeStr) => {
    const [hours, mins] = timeStr.split(':').map(Number);
    return hours * 60 + mins;
};

/**
 * Calculate estimated travel time between two locations
 * Assumes average speed of 30 km/h for farm machinery transport
 * @param {number} distanceKm - Distance in kilometers
 * @returns {number} - Travel time in minutes
 */
const calculateTravelTime = (distanceKm) => {
    const averageSpeedKmH = 30; // 30 km/h average speed
    return Math.ceil((distanceKm / averageSpeedKmH) * 60);
};

/**
 * Sort bookings by location using nearest neighbor algorithm
 * This minimizes total travel distance
 * @param {Array} bookings - Array of booking objects
 * @param {Object} startLocation - Machine's home location coordinates
 * @returns {Array} - Sorted bookings
 */
const sortByLocation = (bookings, startLocation) => {
    if (bookings.length <= 1) return bookings;
    
    const sorted = [];
    const remaining = [...bookings];
    let currentLocation = startLocation || null;
    
    while (remaining.length > 0) {
        let nearestIndex = 0;
        let nearestDistance = Infinity;
        
        // Find the nearest unvisited location
        remaining.forEach((booking, index) => {
            const bookingCoords = booking.fieldLocation?.coordinates;
            
            if (!currentLocation || !bookingCoords?.latitude) {
                // If no coordinates, use priority as fallback
                const priorityScore = booking.priority || 1;
                if (priorityScore > (remaining[nearestIndex]?.priority || 1)) {
                    nearestIndex = index;
                }
            } else {
                const distance = calculateDistance(currentLocation, bookingCoords);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestIndex = index;
                }
            }
        });
        
        // Move nearest booking to sorted list
        const nearestBooking = remaining.splice(nearestIndex, 1)[0];
        nearestBooking._calculatedDistance = nearestDistance === Infinity ? 0 : nearestDistance;
        sorted.push(nearestBooking);
        
        // Update current location
        currentLocation = nearestBooking.fieldLocation?.coordinates || currentLocation;
    }
    
    return sorted;
};

/**
 * Sort bookings by priority (higher priority first)
 * @param {Array} bookings - Array of booking objects
 * @returns {Array} - Priority-sorted bookings
 */
const sortByPriority = (bookings) => {
    return [...bookings].sort((a, b) => {
        // Higher priority first
        const priorityDiff = (b.priority || 1) - (a.priority || 1);
        if (priorityDiff !== 0) return priorityDiff;
        
        // Same priority - sort by acres (larger jobs first for efficiency)
        return (b.acres || 0) - (a.acres || 0);
    });
};

/**
 * Cluster bookings by district/village for better route optimization
 * @param {Array} bookings - Array of booking objects
 * @returns {Object} - Bookings grouped by location cluster
 */
const clusterByLocation = (bookings) => {
    const clusters = {};
    
    bookings.forEach(booking => {
        const district = booking.fieldLocation?.district || 'unknown';
        const village = booking.fieldLocation?.village || 'unknown';
        const clusterKey = `${district}-${village}`;
        
        if (!clusters[clusterKey]) {
            clusters[clusterKey] = [];
        }
        clusters[clusterKey].push(booking);
    });
    
    return clusters;
};

/**
 * Main scheduling function
 * Assigns optimal time slots to bookings
 * 
 * @param {Array} bookings - Array of booking objects with populated machine
 * @param {Object} machine - Machine document with availability settings
 * @returns {Array} - Array of scheduled slots with booking IDs and times
 */
const scheduleJobs = (bookings, machine) => {
    if (!bookings || bookings.length === 0) {
        return [];
    }
    
    // Get machine working hours
    const workingHoursStart = machine?.availability?.workingHoursStart || 8; // 8 AM default
    const workingHoursEnd = machine?.availability?.workingHoursEnd || 18; // 6 PM default
    const machineLocation = machine?.location?.coordinates;
    
    // Convert to minutes since midnight
    let currentTime = workingHoursStart * 60;
    const endTime = workingHoursEnd * 60;
    
    // Step 1: Separate bookings by priority
    const urgentBookings = bookings.filter(b => b.priority === 3);
    const highPriorityBookings = bookings.filter(b => b.priority === 2);
    const normalBookings = bookings.filter(b => (b.priority || 1) === 1);
    
    // Step 2: Sort each priority group by location
    const sortedUrgent = sortByLocation(urgentBookings, machineLocation);
    const sortedHigh = sortByLocation(highPriorityBookings, machineLocation);
    const sortedNormal = sortByLocation(normalBookings, machineLocation);
    
    // Step 3: Combine in priority order
    const sortedBookings = [...sortedUrgent, ...sortedHigh, ...sortedNormal];
    
    // Step 4: Assign time slots
    const scheduledSlots = [];
    let previousLocation = machineLocation;
    let slotOrder = 1;
    
    for (const booking of sortedBookings) {
        // Calculate travel time from previous location
        const bookingCoords = booking.fieldLocation?.coordinates;
        const distanceFromPrevious = previousLocation && bookingCoords 
            ? calculateDistance(previousLocation, bookingCoords) 
            : 0;
        const travelTime = calculateTravelTime(distanceFromPrevious);
        
        // Add travel time buffer (minimum 15 minutes between jobs)
        const bufferTime = Math.max(15, travelTime);
        
        // Calculate job start time (after travel)
        const jobStartTime = currentTime + (slotOrder > 1 ? bufferTime : 0);
        
        // Get job duration
        const jobDuration = booking.estimatedDuration || 60; // Default 1 hour
        const jobEndTime = jobStartTime + jobDuration;
        
        // Check if job fits within working hours
        if (jobEndTime > endTime) {
            console.log(`⚠️ Booking ${booking._id} cannot be scheduled - exceeds working hours`);
            continue; // Skip this booking - doesn't fit in schedule
        }
        
        // Create scheduled slot
        scheduledSlots.push({
            bookingId: booking._id,
            startTime: formatTime(jobStartTime),
            endTime: formatTime(jobEndTime),
            order: slotOrder,
            duration: jobDuration,
            distanceFromPrevious,
            travelTime: bufferTime,
            acres: booking.acres,
            village: booking.fieldLocation?.village || 'Unknown'
        });
        
        // Update for next iteration
        currentTime = jobEndTime;
        previousLocation = bookingCoords || previousLocation;
        slotOrder++;
    }
    
    return scheduledSlots;
};

/**
 * Calculate optimal route for a day's bookings
 * Returns the total distance and ordered list of stops
 * 
 * @param {Array} bookings - Array of scheduled bookings
 * @param {Object} startLocation - Starting coordinates
 * @returns {Object} - Route summary with total distance and stops
 */
const calculateOptimalRoute = (bookings, startLocation) => {
    const sortedBookings = sortByLocation(bookings, startLocation);
    
    let totalDistance = 0;
    let currentLocation = startLocation;
    const stops = [];
    
    for (const booking of sortedBookings) {
        const bookingCoords = booking.fieldLocation?.coordinates;
        const distance = calculateDistance(currentLocation, bookingCoords);
        totalDistance += distance;
        
        stops.push({
            bookingId: booking._id,
            village: booking.fieldLocation?.village,
            district: booking.fieldLocation?.district,
            acres: booking.acres,
            distanceFromPrevious: distance
        });
        
        currentLocation = bookingCoords || currentLocation;
    }
    
    return {
        totalDistance: Math.round(totalDistance * 10) / 10,
        totalStops: stops.length,
        stops
    };
};

/**
 * Check if a time slot is available
 * 
 * @param {Array} existingSlots - Existing scheduled slots
 * @param {string} startTime - Proposed start time (HH:MM)
 * @param {string} endTime - Proposed end time (HH:MM)
 * @returns {boolean} - True if slot is available
 */
const isSlotAvailable = (existingSlots, startTime, endTime) => {
    const proposedStart = parseTime(startTime);
    const proposedEnd = parseTime(endTime);
    
    for (const slot of existingSlots) {
        const slotStart = parseTime(slot.startTime);
        const slotEnd = parseTime(slot.endTime);
        
        // Check for overlap
        if (proposedStart < slotEnd && proposedEnd > slotStart) {
            return false;
        }
    }
    
    return true;
};

/**
 * Get available time slots for a machine on a given day
 * 
 * @param {Array} existingBookings - Existing bookings for the day
 * @param {Object} machine - Machine with availability settings
 * @param {number} requiredDuration - Required duration in minutes
 * @returns {Array} - Available time slot options
 */
const getAvailableSlots = (existingBookings, machine, requiredDuration) => {
    const workingHoursStart = (machine?.availability?.workingHoursStart || 8) * 60;
    const workingHoursEnd = (machine?.availability?.workingHoursEnd || 18) * 60;
    
    // Sort existing bookings by start time
    const sortedBookings = existingBookings
        .filter(b => b.timeSlots?.startTime)
        .sort((a, b) => parseTime(a.timeSlots.startTime) - parseTime(b.timeSlots.startTime));
    
    const availableSlots = [];
    let currentTime = workingHoursStart;
    
    for (const booking of sortedBookings) {
        const bookingStart = parseTime(booking.timeSlots.startTime);
        
        // Check if there's a gap before this booking
        const gapDuration = bookingStart - currentTime;
        if (gapDuration >= requiredDuration) {
            availableSlots.push({
                startTime: formatTime(currentTime),
                endTime: formatTime(currentTime + requiredDuration),
                gapDuration
            });
        }
        
        // Move current time to after this booking
        currentTime = parseTime(booking.timeSlots.endTime);
    }
    
    // Check for slot after last booking
    const remainingTime = workingHoursEnd - currentTime;
    if (remainingTime >= requiredDuration) {
        availableSlots.push({
            startTime: formatTime(currentTime),
            endTime: formatTime(currentTime + requiredDuration),
            gapDuration: remainingTime
        });
    }
    
    return availableSlots;
};

/**
 * Estimate daily capacity utilization
 * 
 * @param {Array} bookings - Day's bookings
 * @param {Object} machine - Machine details
 * @returns {Object} - Utilization metrics
 */
const calculateUtilization = (bookings, machine) => {
    const workingHoursStart = machine?.availability?.workingHoursStart || 8;
    const workingHoursEnd = machine?.availability?.workingHoursEnd || 18;
    const totalWorkingMinutes = (workingHoursEnd - workingHoursStart) * 60;
    
    let totalBookedMinutes = 0;
    let totalAcres = 0;
    
    bookings.forEach(booking => {
        totalBookedMinutes += booking.estimatedDuration || 0;
        totalAcres += booking.acres || 0;
    });
    
    const utilizationPercent = Math.round((totalBookedMinutes / totalWorkingMinutes) * 100);
    const acresCapacity = machine?.dailyCapacityAcres || 10;
    const acresUtilization = Math.round((totalAcres / acresCapacity) * 100);
    
    return {
        totalWorkingMinutes,
        bookedMinutes: totalBookedMinutes,
        availableMinutes: totalWorkingMinutes - totalBookedMinutes,
        timeUtilization: `${utilizationPercent}%`,
        totalAcres,
        acresCapacity,
        acresUtilization: `${acresUtilization}%`,
        bookingCount: bookings.length
    };
};

// Export all scheduling functions
module.exports = {
    scheduleJobs,
    sortByLocation,
    sortByPriority,
    clusterByLocation,
    calculateDistance,
    calculateTravelTime,
    calculateOptimalRoute,
    isSlotAvailable,
    getAvailableSlots,
    calculateUtilization,
    formatTime,
    parseTime
};
