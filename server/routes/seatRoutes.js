const express = require('express');
const router = express.Router();
const { initializeFirebase } = require('../config/firebase');

const db = initializeFirebase();
const seatsCollection = db.collection('seats');

// In-memory cache for seat data
const seatCache = new Map();
const CACHE_TTL = 30000; // 30 seconds

// Cache helper functions
const getCacheKey = (route, date) => `${route}-${date}`;

const getCachedSeats = (route, date) => {
    const key = getCacheKey(route, date);
    const cached = seatCache.get(key);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    return null;
};

const setCachedSeats = (route, date, data) => {
    const key = getCacheKey(route, date);
    seatCache.set(key, {
        data,
        timestamp: Date.now()
    });
};

const invalidateCache = (route, date) => {
    const key = getCacheKey(route, date);
    seatCache.delete(key);
};

// Clear old cache entries periodically (every 5 minutes)
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of seatCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
            seatCache.delete(key);
        }
    }
}, 300000);

// Helper function to determine seat position
const getSeatPosition = (seatNumber, totalSeats) => {
    const backRowStart = totalSeats - 4; // e.g., for 51 seats, back row starts at 47

    // Back row (Last 5 seats)
    if (seatNumber >= backRowStart) {
        if (seatNumber === backRowStart || seatNumber === totalSeats) return 'Window';
        if (seatNumber === backRowStart + 1 || seatNumber === totalSeats - 1) return 'Aisle';
        return 'Middle';
    }

    const standardSeatsCount = backRowStart - 1;
    const remainder = standardSeatsCount % 4;
    const lastFullRowSeat = standardSeatsCount - remainder;

    // Partial row (at the end of standard seats, before back row)
    if (seatNumber > lastFullRowSeat) {
        // If it's the last seat of the partial row, it's a Window seat
        if (seatNumber === standardSeatsCount) return 'Window';
        return 'Aisle';
    }

    // Standard rows (1-44 in 51 seat config)
    const position = (seatNumber - 1) % 4;
    if (position === 0 || position === 3) return 'Window';
    if (position === 1 || position === 2) return 'Aisle';
    return 'Middle';
};

// Initialize seats for both routes (call once to set up the database)
router.post('/initialize', async (req, res) => {
    try {
        const { date, seatCount, force } = req.query; // Optional date, seatCount, and force parameters
        const targetDate = date || new Date().toISOString().split('T')[0]; // Default to today (YYYY-MM-DD)
        const totalSeats = parseInt(seatCount) || 51; // Default to 51 seats if not specified

        const routes = ['Mannar to Colombo', 'Colombo to Mannar'];
        let initialized = 0;

        for (const route of routes) {
            // Check if seats already exist for this route and date
            const existingSnapshot = await seatsCollection
                .where('route', '==', route)
                .where('date', '==', targetDate)
                .get();

            if (!existingSnapshot.empty) {
                if (force === 'true') {
                    // Smart update: Preserve bookings, update layout
                    const existingSeatsMap = new Map();
                    existingSnapshot.forEach(doc => {
                        existingSeatsMap.set(doc.data().seatNumber, doc);
                    });

                    const batch = db.batch();

                    // 1. Update existing seats and create new ones
                    for (let i = 1; i <= totalSeats; i++) {
                        const newPosition = getSeatPosition(i, totalSeats);
                        const newRowNumber = Math.ceil(i / 4);

                        if (existingSeatsMap.has(i)) {
                            // Update existing seat (preserve booking data, update layout info)
                            const doc = existingSeatsMap.get(i);
                            batch.update(doc.ref, {
                                position: newPosition,
                                rowNumber: newRowNumber,
                                updatedAt: new Date()
                            });
                            // Remove from map to track what's left (to be deleted)
                            existingSeatsMap.delete(i);
                        } else {
                            // Create new seat
                            const newSeatRef = seatsCollection.doc();
                            batch.set(newSeatRef, {
                                seatNumber: i,
                                route: route,
                                date: targetDate,
                                isBooked: false,
                                isPickedUp: false,
                                passengerName: '',
                                passengerPhone: '',
                                boardingPoint: '',
                                gender: '',
                                rowNumber: newRowNumber,
                                position: newPosition,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            });
                        }
                    }

                    // 2. Delete seats that are no longer needed (beyond new totalSeats)
                    for (const [seatNum, doc] of existingSeatsMap) {
                        batch.delete(doc.ref);
                    }

                    await batch.commit();
                    invalidateCache(route, targetDate);
                    initialized++;
                    continue; // Done with this route
                } else {
                    continue; // Skip if seats already initialized and not forced
                }
            }

            // Create seats (Fresh initialization)
            const batch = db.batch();
            for (let i = 1; i <= totalSeats; i++) {
                const seatData = {
                    seatNumber: i,
                    route: route,
                    date: targetDate, // YYYY-MM-DD format
                    isBooked: false,
                    isPickedUp: false,
                    passengerName: '',
                    passengerPhone: '',
                    boardingPoint: '',
                    gender: '', // 'male' or 'female'
                    rowNumber: Math.ceil(i / 4), // Approximate row number
                    position: getSeatPosition(i, totalSeats),
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                const docRef = seatsCollection.doc();
                batch.set(docRef, seatData);
            }

            await batch.commit();
            initialized++;
        }

        res.json({
            success: true,
            message: `Seats initialized/updated successfully for ${initialized} route(s) on ${targetDate} with ${totalSeats} seats`
        });
    } catch (error) {
        console.error('Error initializing seats:', error);
        res.status(500).json({
            success: false,
            message: 'Error initializing seats',
            error: error.message
        });
    }
});

// Get all seats for a specific route and date
router.get('/', async (req, res) => {
    try {
        const { route, date } = req.query;

        if (!route) {
            return res.status(400).json({
                success: false,
                message: 'Route parameter is required'
            });
        }

        const targetDate = date || new Date().toISOString().split('T')[0]; // Default to today

        // Check cache first
        const cachedSeats = getCachedSeats(route, targetDate);
        if (cachedSeats) {
            return res.json({ success: true, data: cachedSeats });
        }

        const snapshot = await seatsCollection
            .where('route', '==', route)
            .where('date', '==', targetDate)
            .get();

        const seats = [];
        snapshot.forEach(doc => {
            seats.push({
                _id: doc.id,
                ...doc.data()
            });
        });

        // Sort in memory to avoid Firestore composite index requirement
        seats.sort((a, b) => a.seatNumber - b.seatNumber);

        // Cache the results
        setCachedSeats(route, targetDate, seats);

        res.json({ success: true, data: seats });
    } catch (error) {
        console.error('Error fetching seats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching seats',
            error: error.message
        });
    }
});

// Book a seat
router.post('/:id/book', async (req, res) => {
    try {
        const { passengerName, passengerPhone, gender, boardingPoint } = req.body;

        if (!passengerPhone) {
            return res.status(400).json({
                success: false,
                message: 'Passenger phone is required'
            });
        }

        if (!gender || (gender !== 'male' && gender !== 'female')) {
            return res.status(400).json({
                success: false,
                message: 'Gender is required (male or female)'
            });
        }

        const seatRef = seatsCollection.doc(req.params.id);
        const seatDoc = await seatRef.get();

        if (!seatDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Seat not found'
            });
        }

        const seat = seatDoc.data();

        if (seat.isBooked) {
            return res.status(400).json({
                success: false,
                message: 'Seat is already booked'
            });
        }

        await seatRef.update({
            isBooked: true,
            isPickedUp: false,
            passengerName,
            passengerPhone,
            gender,
            boardingPoint: boardingPoint || '',
            updatedAt: new Date()
        });

        const updatedDoc = await seatRef.get();
        const seatData = updatedDoc.data();

        // Invalidate cache for this route and date
        invalidateCache(seatData.route, seatData.date);

        res.json({
            success: true,
            message: 'Seat booked successfully',
            data: { _id: updatedDoc.id, ...seatData }
        });
    } catch (error) {
        console.error('Error booking seat:', error);
        res.status(500).json({
            success: false,
            message: 'Error booking seat',
            error: error.message
        });
    }
});

// Update passenger information
router.put('/:id/update', async (req, res) => {
    try {
        const { passengerName, passengerPhone, gender, boardingPoint } = req.body;

        if (!passengerPhone) {
            return res.status(400).json({
                success: false,
                message: 'Passenger phone is required'
            });
        }

        if (!gender || (gender !== 'male' && gender !== 'female')) {
            return res.status(400).json({
                success: false,
                message: 'Gender is required (male or female)'
            });
        }

        const seatRef = seatsCollection.doc(req.params.id);
        const seatDoc = await seatRef.get();

        if (!seatDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Seat not found'
            });
        }

        await seatRef.update({
            passengerName,
            passengerPhone,
            gender,
            boardingPoint: boardingPoint || '',
            updatedAt: new Date()
        });

        const updatedDoc = await seatRef.get();
        const seatData = updatedDoc.data();

        // Invalidate cache for this route and date
        invalidateCache(seatData.route, seatData.date);

        res.json({
            success: true,
            message: 'Passenger information updated successfully',
            data: { _id: updatedDoc.id, ...seatData }
        });
    } catch (error) {
        console.error('Error updating passenger information:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating passenger information',
            error: error.message
        });
    }
});

// Cancel booking
router.delete('/:id/cancel', async (req, res) => {
    try {
        const seatRef = seatsCollection.doc(req.params.id);
        const seatDoc = await seatRef.get();

        if (!seatDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Seat not found'
            });
        }

        await seatRef.update({
            isBooked: false,
            isPickedUp: false,
            passengerName: '',
            passengerPhone: '',
            gender: '',
            boardingPoint: '',
            updatedAt: new Date()
        });

        const updatedDoc = await seatRef.get();
        const seatData = updatedDoc.data();

        // Invalidate cache for this route and date
        invalidateCache(seatData.route, seatData.date);

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: { _id: updatedDoc.id, ...seatData }
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling booking',
            error: error.message
        });
    }
});

// Toggle pickup status
router.patch('/:id/pickup', async (req, res) => {
    try {
        const { isPickedUp } = req.body;

        if (typeof isPickedUp !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isPickedUp must be a boolean value'
            });
        }

        const seatRef = seatsCollection.doc(req.params.id);
        const seatDoc = await seatRef.get();

        if (!seatDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Seat not found'
            });
        }

        await seatRef.update({
            isPickedUp,
            updatedAt: new Date()
        });

        const updatedDoc = await seatRef.get();
        const seatData = updatedDoc.data();

        // Invalidate cache for this route and date
        invalidateCache(seatData.route, seatData.date);

        res.json({
            success: true,
            message: `Passenger marked as ${isPickedUp ? 'picked up' : 'waiting'}`,
            data: { _id: updatedDoc.id, ...seatData }
        });
    } catch (error) {
        console.error('Error updating pickup status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating pickup status',
            error: error.message
        });
    }
});

module.exports = router;
