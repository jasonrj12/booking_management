const { initializeFirebase } = require('./config/firebase');

const cleanupDuplicates = async () => {
    try {
        const db = initializeFirebase();
        const seatsCollection = db.collection('seats');
        const routes = ['Mannar to Colombo', 'Colombo to Mannar'];

        for (const route of routes) {
            console.log(`Cleaning up route: ${route}`);
            const snapshot = await seatsCollection.where('route', '==', route).get();

            const seatMap = new Map();
            const duplicatesToDelete = [];

            // Group seats by seat number
            snapshot.forEach(doc => {
                const data = doc.data();
                const seatNum = data.seatNumber;

                if (!seatMap.has(seatNum)) {
                    // Keep the first occurrence
                    seatMap.set(seatNum, doc.id);
                } else {
                    // Mark duplicates for deletion
                    duplicatesToDelete.push(doc.id);
                }
            });

            // Delete duplicates
            if (duplicatesToDelete.length > 0) {
                console.log(`Deleting ${duplicatesToDelete.length} duplicate seats...`);
                const batch = db.batch();

                duplicatesToDelete.forEach(docId => {
                    batch.delete(seatsCollection.doc(docId));
                });

                await batch.commit();
                console.log(`✅ Deleted ${duplicatesToDelete.length} duplicates for ${route}`);
            } else {
                console.log(`No duplicates found for ${route}`);
            }

            // Verify final count
            const finalSnapshot = await seatsCollection.where('route', '==', route).get();
            console.log(`Final seat count: ${finalSnapshot.size}`);
            console.log('-------------------');
        }

        console.log('✅ Cleanup completed successfully!');
    } catch (error) {
        console.error('Error cleaning up duplicates:', error);
    }
};

cleanupDuplicates();
