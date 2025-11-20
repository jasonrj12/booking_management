const admin = require('firebase-admin');
const serviceAccount = require('./firebase-credentials.json');

console.log('Attempting to initialize Firebase...');

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase initialized successfully!');

    const db = admin.firestore();
    console.log('✅ Firestore instance created');

    // Try to list collections to verify connection
    db.listCollections().then(collections => {
        console.log('✅ Connected to Firestore. Collections:', collections.map(c => c.id));
    }).catch(err => {
        console.error('❌ Error connecting to Firestore:', err);
    });

} catch (error) {
    console.error('❌ Initialization Error:', error);
}
