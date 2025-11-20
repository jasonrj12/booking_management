const { initializeFirebase } = require('./config/firebase');

// Helper function to determine seat position
const getSeatPosition = (seatNumber) => {
    // Back row (seats 47-51) - 5 seats
    if (seatNumber >= 47 && seatNumber <= 51) {
        if (seatNumber === 47 || seatNumber === 51) return 'Window';
        if (seatNumber === 48 || seatNumber === 50) return 'Aisle';
        return 'Middle'; // seat 49
    }

    // Standard rows (seats 1-46)
    const position = (seatNumber - 1) % 4;
    if (position === 0 || position === 3) return 'Window';
    if (position === 1 || position === 2) return 'Aisle';
    return 'Middle';
};

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const db = initializeFirebase();
        const seatsCollection = db.collection('seats');

        let path = event.path;

        // Remove the function prefix, handling both rewritten and direct paths
        if (path.startsWith('/.netlify/functions/seats')) {
            path = path.replace('/.netlify/functions/seats', '');
        } else if (path.startsWith('/api/seats')) {
            path = path.replace('/api/seats', '');
        }

        const method = event.httpMethod;

        // Parse the path and extract parameters
        const pathParts = path.split('/').filter(Boolean);

        // GET /api/seats - Get all seats for a route and date
        if (method === 'GET' && pathParts.length === 0) {
            const params = event.queryStringParameters || {};
            const { route, date } = params;

            if (!route) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        message: 'Route parameter is required'
                    })
                };
            }

            const targetDate = date || new Date().toISOString().split('T')[0];

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

            seats.sort((a, b) => a.seatNumber - b.seatNumber);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, data: seats })
            };
        }

        // POST /api/seats/initialize - Initialize seats
        if (method === 'POST' && pathParts[0] === 'initialize') {
            const params = event.queryStringParameters || {};
            const { date } = params;
            const targetDate = date || new Date().toISOString().split('T')[0];

            const routes = ['Mannar to Colombo', 'Colombo to Mannar'];
            let initialized = 0;

            for (const route of routes) {
                const existingSeats = await seatsCollection
                    .where('route', '==', route)
                    .where('date', '==', targetDate)
                    .limit(1)
                    .get();

                if (!existingSeats.empty) {
                    continue;
                }

                const batch = db.batch();
                for (let i = 1; i <= 51; i++) {
                    const seatData = {
                        seatNumber: i,
                        route: route,
                        date: targetDate,
                        isBooked: false,
                        isPickedUp: false,
                        passengerName: '',
                        passengerPhone: '',
                        boardingPoint: '',
                        gender: '',
                        rowNumber: i <= 46 ? Math.ceil(i / 4) : 13,
                        position: getSeatPosition(i),
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };

                    const docRef = seatsCollection.doc();
                    batch.set(docRef, seatData);
                }

                await batch.commit();
                initialized++;
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: `Seats initialized successfully for ${initialized} route(s) on ${targetDate}`
                })
            };
        }

        // POST /api/seats/:id/book - Book a seat
        if (method === 'POST' && pathParts.length === 2 && pathParts[1] === 'book') {
            const seatId = pathParts[0];
            const body = JSON.parse(event.body || '{}');
            const { passengerName, passengerPhone, gender, boardingPoint } = body;

            if (!passengerPhone) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        message: 'Passenger phone is required'
                    })
                };
            }

            if (!gender || (gender !== 'male' && gender !== 'female')) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        message: 'Gender is required (male or female)'
                    })
                };
            }

            const seatRef = seatsCollection.doc(seatId);
            const seatDoc = await seatRef.get();

            if (!seatDoc.exists) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        message: 'Seat not found'
                    })
                };
            }

            const seat = seatDoc.data();

            if (seat.isBooked) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        message: 'Seat is already booked'
                    })
                };
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
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Seat booked successfully',
                    data: { _id: updatedDoc.id, ...updatedDoc.data() }
                })
            };
        }

        // PUT /api/seats/:id/update - Update passenger info
        if (method === 'PUT' && pathParts.length === 2 && pathParts[1] === 'update') {
            const seatId = pathParts[0];
            const body = JSON.parse(event.body || '{}');
            const { passengerName, passengerPhone, gender, boardingPoint } = body;

            if (!passengerPhone) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        message: 'Passenger phone is required'
                    })
                };
            }

            if (!gender || (gender !== 'male' && gender !== 'female')) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        message: 'Gender is required (male or female)'
                    })
                };
            }

            const seatRef = seatsCollection.doc(seatId);
            const seatDoc = await seatRef.get();

            if (!seatDoc.exists) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        message: 'Seat not found'
                    })
                };
            }

            await seatRef.update({
                passengerName,
                passengerPhone,
                gender,
                boardingPoint: boardingPoint || '',
                updatedAt: new Date()
            });

            const updatedDoc = await seatRef.get();
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Passenger information updated successfully',
                    data: { _id: updatedDoc.id, ...updatedDoc.data() }
                })
            };
        }

        // DELETE /api/seats/:id/cancel - Cancel booking
        if (method === 'DELETE' && pathParts.length === 2 && pathParts[1] === 'cancel') {
            const seatId = pathParts[0];

            const seatRef = seatsCollection.doc(seatId);
            const seatDoc = await seatRef.get();

            if (!seatDoc.exists) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        message: 'Seat not found'
                    })
                };
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
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Booking cancelled successfully',
                    data: { _id: updatedDoc.id, ...updatedDoc.data() }
                })
            };
        }

        // PATCH /api/seats/:id/pickup - Toggle pickup status
        if (method === 'PATCH' && pathParts.length === 2 && pathParts[1] === 'pickup') {
            const seatId = pathParts[0];
            const body = JSON.parse(event.body || '{}');
            const { isPickedUp } = body;

            if (typeof isPickedUp !== 'boolean') {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        message: 'isPickedUp must be a boolean value'
                    })
                };
            }

            const seatRef = seatsCollection.doc(seatId);
            const seatDoc = await seatRef.get();

            if (!seatDoc.exists) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        message: 'Seat not found'
                    })
                };
            }

            await seatRef.update({
                isPickedUp,
                updatedAt: new Date()
            });

            const updatedDoc = await seatRef.get();
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: `Passenger marked as ${isPickedUp ? 'picked up' : 'waiting'}`,
                    data: { _id: updatedDoc.id, ...updatedDoc.data() }
                })
            };
        }

        // Route not found
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
                success: false,
                message: `Route not found. Received path: ${event.path}, Parsed path: ${path}`
            })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Internal server error',
                error: error.message
            })
        };
    }
};
