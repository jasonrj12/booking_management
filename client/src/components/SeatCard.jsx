import React, { memo } from 'react';
import { FaUserAlt } from 'react-icons/fa';

const SeatCard = memo(({ seat, onClick }) => {
    const isBooked = seat.isBooked;
    const isMale = isBooked && seat.gender === 'male';
    const isFemale = isBooked && seat.gender === 'female';

    // Determine seat card class based on booking status and gender
    let seatClass = 'seat-available';
    if (isMale) {
        seatClass = 'seat-booked-male';
    } else if (isFemale) {
        seatClass = 'seat-booked-female';
    } else if (isBooked) {
        seatClass = 'seat-booked'; // Fallback for old data without gender
    }

    return (
        <div
            onClick={() => onClick(seat)}
            className={`seat-card ${seatClass} group relative`}
            title={isBooked ? `${seat.passengerName} - ${seat.passengerPhone}` : 'Available'}
        >
            <div className="flex flex-col items-center justify-center gap-1">
                <div className="text-lg font-bold">{seat.seatNumber}</div>
                {isBooked && (
                    <FaUserAlt className="text-xs text-green-300" />
                )}
            </div>

            {/* Hover Tooltip */}
            {isBooked && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    <div className="font-semibold">{seat.passengerName}</div>
                    <div className="text-white/70">{seat.passengerPhone}</div>
                    <div className="text-white/70 capitalize">{seat.gender}</div>
                </div>
            )}

            {/* Position Indicator */}
            <div className="absolute top-1 right-1">
                {seat.position === 'Window' && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full" title="Window Seat"></div>
                )}
                {seat.position === 'Aisle' && (
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Aisle Seat"></div>
                )}
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison - only re-render if seat data changed
    return prevProps.seat._id === nextProps.seat._id &&
        prevProps.seat.isBooked === nextProps.seat.isBooked &&
        prevProps.seat.passengerName === nextProps.seat.passengerName &&
        prevProps.seat.gender === nextProps.seat.gender;
});

SeatCard.displayName = 'SeatCard';

export default SeatCard;
