const { initializeFirebase } = require('./config/firebase');

const checkDuplicates = async () => {
    try {
        const db = initializeFirebase();
        const seatsCollection = db.collection('seats');
        const routes = ['Mannar to Colombo', 'Colombo to Mannar'];

        for (const route of routes) {
            console.log(`Checking route: ${route}`);
            const snapshot = await seatsCollection.where('route', '==', route).get();

            const seatCounts = {};
            let totalSeats = 0;

            snapshot.forEach(doc => {
                const data = doc.data();
                const seatNum = data.seatNumber;
                seatCounts[seatNum] = (seatCounts[seatNum] || 0) + 1;
                totalSeats++;
            });

            console.log(`Total seats found: ${totalSeats}`);

            const duplicates = Object.entries(seatCounts).filter(([num, count]) => count > 1);

            if (duplicates.length > 0) {
                console.log('Duplicates found:');
                duplicates.forEach(([num, count]) => {
                    console.log(`Seat ${num}: ${count} times`);
                });
            } else {
                console.log('No duplicates found.');
            }
            console.log('-------------------');
        }
    } catch (error) {
        console.error('Error checking duplicates:', error);
    }
};

checkDuplicates();
