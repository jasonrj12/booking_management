const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
    try {
        // Check if Firebase is already initialized
        if (admin.apps.length > 0) {
            return admin.firestore();
        }

        const serviceAccount = require('../firebase-credentials.json');

        // Initialize with service account file
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        console.log('✅ Firebase initialized successfully');
        return admin.firestore();
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        throw error;
    }
};

module.exports = { initializeFirebase, admin };
