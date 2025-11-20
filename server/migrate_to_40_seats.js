const { initializeFirebase } = require('./config/firebase');

const migrateToFortySeats = async () => {
    try {
        const db = initializeFirebase();
        const seatsCollection = db.collection('seats');
        const routes = ['Mannar to Colombo', 'Colombo to Mannar'];

        console.log('🔄 Starting migration to 40-seat layout with 5-seat back row...\n');

        for (const route of routes) {
            console.log(`Processing route: ${route}`);

            // Delete all existing seats for this route
            const existingSeats = await seatsCollection.where('route', '==', route).get();

            if (!existingSeats.empty) {
                console.log(`  Deleting ${existingSeats.size} old seats...`);
                const deleteBatch = db.batch();

                existingSeats.forEach(doc => {
                    deleteBatch.delete(doc.ref);
                });

                await deleteBatch.commit();
                console.log(`  ✅ Deleted old seats`);
            }

            console.log('-------------------');
        }

        console.log('\n✅ Migration completed!');
        console.log('Please call the /api/seats/initialize endpoint to create the new 40-seat layout.');

    } catch (error) {
        console.error('Error during migration:', error);
    }
};

migrateToFortySeats();
