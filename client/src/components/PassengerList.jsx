import React, { memo, useMemo } from 'react';
import { FaUser, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

// Individual passenger item component
const PassengerItem = memo(({ seat }) => {
    const handleCall = (e) => {
        e.stopPropagation();
        if (seat.passengerPhone) {
            window.location.href = `tel:${seat.passengerPhone}`;
        }
    };

    return (
        <div className="bg-white/5 p-2.5 md:p-3 rounded-lg border border-white/5">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1.5">
                    {/* Name and Seat */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <FaUser className="text-xs text-blue-300" />
                            <span className="font-semibold text-sm md:text-base">
                                {seat.passengerName || <span className="text-white/50 italic">Guest</span>}
                            </span>
                        </div>
                        <div className="text-xs md:text-sm">
                            <span className="text-white/60">Seat no:</span>{' '}
                            <span className="font-bold text-green-400">#{seat.seatNumber}</span>
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div className="text-xs md:text-sm text-white/70 flex items-center gap-1.5">
                        <FaPhone className="text-[10px] text-green-300" />
                        {seat.passengerPhone}
                    </div>
                </div>

                {/* Call Button */}
                <button
                    onClick={handleCall}
                    className="shrink-0 p-2 md:p-2.5 bg-green-600/20 hover:bg-green-600/40 rounded-lg border border-green-500/30 transition-all duration-200 hover:scale-105 active:scale-95 group"
                    title={`Call ${seat.passengerName || 'passenger'}`}
                >
                    <FaPhone className="text-sm md:text-base text-green-400 group-hover:text-green-300" />
                </button>
            </div>
        </div>
    );
});

PassengerItem.displayName = 'PassengerItem';

// Location group component
const LocationGroup = memo(({ location, passengers }) => {
    return (
        <div className="glass-card p-3 md:p-4">
            {/* Location Header */}
            <div className="flex items-start gap-2 mb-3 pb-3 border-b border-white/10">
                <FaMapMarkerAlt className="text-base md:text-lg text-blue-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                    <h3 className="font-bold text-base md:text-lg text-white">
                        {location || 'No Location Specified'}
                    </h3>
                    <p className="text-xs md:text-sm text-white/60 mt-0.5">
                        {passengers.length} {passengers.length === 1 ? 'passenger' : 'passengers'}
                    </p>
                </div>
            </div>

            {/* Passengers at this location */}
            <div className="space-y-2">
                {passengers.map((seat) => (
                    <PassengerItem
                        key={seat._id}
                        seat={seat}
                    />
                ))}
            </div>
        </div>
    );
});

LocationGroup.displayName = 'LocationGroup';

const PassengerList = memo(({ seats }) => {
    const bookedSeats = seats.filter(seat => seat.isBooked);

    // Group seats by boarding location
    const groupedByLocation = useMemo(() => {
        const groups = {};
        bookedSeats.forEach(seat => {
            const location = seat.boardingPoint || 'No Location';
            if (!groups[location]) {
                groups[location] = [];
            }
            groups[location].push(seat);
        });

        // Sort passengers within each location by seat number
        Object.keys(groups).forEach(location => {
            groups[location].sort((a, b) => a.seatNumber - b.seatNumber);
        });

        // Convert to array and sort by location name
        return Object.entries(groups)
            .sort(([a], [b]) => {
                // Put "No Location" at the end
                if (a === 'No Location') return 1;
                if (b === 'No Location') return -1;
                return a.localeCompare(b);
            });
    }, [bookedSeats]);

    return (
        <div className="glass-effect p-4 md:p-6 h-full">
            {bookedSeats.length === 0 ? (
                <div className="text-center py-8 md:py-12 text-white/50">
                    <FaUser className="text-5xl md:text-6xl mx-auto mb-3 md:mb-4 opacity-30" />
                    <p className="text-base md:text-lg">No passengers booked yet</p>
                    <p className="text-xs md:text-sm mt-2">Click on an available seat to book</p>
                </div>
            ) : (
                <div className="space-y-3 md:space-y-4 max-h-[400px] md:max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {groupedByLocation.map(([location, passengers]) => (
                        <LocationGroup
                            key={location}
                            location={location}
                            passengers={passengers}
                        />
                    ))}
                </div>
            )}

            {/* Custom scrollbar styles */}
            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
        </div>
    );
});

PassengerList.displayName = 'PassengerList';

export default PassengerList;
