const admin = require('firebase-admin');

let db = null;

// Initialize Firebase Admin SDK for serverless
const initializeFirebase = () => {
    try {
        // Check if Firebase is already initialized
        if (admin.apps.length > 0) {
            if (!db) {
                db = admin.firestore();
            }
            return db;
        }

        // For Netlify, use environment variables instead of JSON file
        const serviceAccount = {
            type: process.env.FIREBASE_TYPE,
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: process.env.FIREBASE_AUTH_URI,
            token_uri: process.env.FIREBASE_TOKEN_URI,
            auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
            client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
        };

        // Initialize with service account
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        db = admin.firestore();
        console.log('✅ Firebase initialized successfully');
        return db;
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        throw error;
    }
};

module.exports = { initializeFirebase, admin };
