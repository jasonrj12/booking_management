import React, { memo, useMemo } from 'react';
import { FaUser, FaPhone, FaTrash, FaEdit, FaMapMarkerAlt, FaUserCheck } from 'react-icons/fa';

// Memoized PassengerCard component to prevent unnecessary re-renders
const PassengerCard = memo(({ passenger, onEdit }) => {
    // Use first seat for actions
    const firstSeat = passenger.seats[0];
    const seatNumbers = passenger.seats.map(s => s.seatNumber).sort((a, b) => a - b);

    return (
        <div
            onClick={() => onEdit(firstSeat)} // Re-using onEdit to open details since App.jsx handles it
            className="glass-card p-3 md:p-4 hover:bg-white/15 transition-all duration-200 cursor-pointer group"
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    {/* Seat Numbers and Name Row */}
                    <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                        <div className="flex gap-1.5">
                            {seatNumbers.map((seatNum, index) => (
                                <div key={seatNum} className="bg-green-600/30 px-2 py-1 md:px-3 md:py-1 rounded-lg border border-green-500/50 font-bold text-sm md:text-base group-hover:bg-green-600/40 transition-colors">
                                    #{seatNum}
                                </div>
                            ))}
                        </div>
                        <div className="font-semibold text-base md:text-lg flex items-center gap-2">
                            <FaUser className="text-xs md:text-sm text-blue-300" />
                            {passenger.passengerName || <span className="text-white/50 italic">Guest</span>}
                        </div>
                    </div>

                    {/* Phone Number Row */}
                    <div className="text-xs md:text-sm text-white/70 flex items-center gap-2">
                        <FaPhone className="text-[10px] md:text-xs text-green-300" />
                        {passenger.passengerPhone}
                    </div>
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function - only re-render if passenger data changed
    const prevSeats = prevProps.passenger.seats.map(s => s._id).join(',');
    const nextSeats = nextProps.passenger.seats.map(s => s._id).join(',');

    return prevSeats === nextSeats &&
        prevProps.passenger.passengerName === nextProps.passenger.passengerName &&
        prevProps.passenger.passengerPhone === nextProps.passenger.passengerPhone &&
        prevProps.passenger.boardingPoint === nextProps.passenger.boardingPoint &&
        prevProps.passenger.isPickedUp === nextProps.passenger.isPickedUp;
});

PassengerCard.displayName = 'PassengerCard';

const PassengerList = memo(({ seats, onEdit }) => {
    const bookedSeats = seats.filter(seat => seat.isBooked);

    // Group seats by passenger phone number
    const groupedPassengers = useMemo(() => {
        const groups = {};
        bookedSeats.forEach(seat => {
            const key = seat.passengerPhone;
            if (!groups[key]) {
                groups[key] = {
                    passengerName: seat.passengerName,
                    passengerPhone: seat.passengerPhone,
                    boardingPoint: seat.boardingPoint,
                    seats: [],
                    isPickedUp: seat.isPickedUp, // Use first seat's pickup status
                };
            }
            groups[key].seats.push(seat);
        });
        return Object.values(groups);
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
                <div className="space-y-2 md:space-y-3 max-h-[400px] md:max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {groupedPassengers.map((passenger) => (
                        <PassengerCard
                            key={passenger.passengerPhone}
                            passenger={passenger}
                            onEdit={onEdit}
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
