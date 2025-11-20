const express = require('express');
const cors = require('cors');
require('dotenv').config();

const seatRoutes = require('./routes/seatRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/seats', seatRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Bus Reservation API Server (Firebase)' });
});

// Server configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('💾 Using Firebase Firestore as database');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Server shutting down gracefully');
    process.exit(0);
});
