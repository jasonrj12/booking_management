import React, { memo } from 'react';
import { FaUserAlt, FaCheckCircle, FaUserCheck } from 'react-icons/fa';

const SeatCard = memo(({ seat, onClick, isSelected }) => {
    const isBooked = seat.isBooked;
    const isMale = isBooked && seat.gender === 'male';
    const isFemale = isBooked && seat.gender === 'female';
    const isPickedUp = seat.isPickedUp;

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
            className={`seat-card ${seatClass} group relative ${isSelected ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-slate-900 animate-pulse-slow' : ''
                } ${isPickedUp ? 'ring-2 ring-green-400 ring-offset-1 ring-offset-slate-900' : ''}`}
            title={isBooked ? `${seat.passengerName} - ${seat.passengerPhone} ${isPickedUp ? '(Picked Up)' : ''}` : 'Available'}
        >
            <div className="flex flex-col items-center justify-center gap-1">
                <div className="text-lg font-bold">{seat.seatNumber}</div>
                {isBooked && (
                    isPickedUp ? (
                        <FaUserCheck className="text-sm text-white drop-shadow-md" />
                    ) : (
                        <FaUserAlt className="text-xs text-white/70" />
                    )
                )}
            </div>

            {/* Selection Indicator */}
            {isSelected && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 shadow-lg z-20">
                    <FaCheckCircle className="text-slate-900 text-sm" />
                </div>
            )}

            {/* Picked Up Indicator Badge */}
            {isPickedUp && !isSelected && (
                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 shadow-lg z-10">
                    <FaCheckCircle className="text-white text-[10px]" />
                </div>
            )}

            {/* Hover Tooltip */}
            {isBooked && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                    <div className="font-semibold">{seat.passengerName}</div>
                    <div className="text-white/70">{seat.passengerPhone}</div>
                    <div className="text-white/70 capitalize">{seat.gender}</div>
                    {isPickedUp && <div className="text-green-400 font-bold mt-1">Picked Up</div>}
                </div>
            )}

            {/* Position Indicator */}
            <div className="absolute top-1 left-1">
                {seat.position === 'Window' && (
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" title="Window Seat"></div>
                )}
                {seat.position === 'Aisle' && (
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" title="Aisle Seat"></div>
                )}
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison - only re-render if seat data changed
    return prevProps.seat._id === nextProps.seat._id &&
        prevProps.seat.isBooked === nextProps.seat.isBooked &&
        prevProps.seat.passengerName === nextProps.seat.passengerName &&
        prevProps.seat.gender === nextProps.seat.gender &&
        prevProps.seat.isPickedUp === nextProps.seat.isPickedUp &&
        prevProps.isSelected === nextProps.isSelected;
});

SeatCard.displayName = 'SeatCard';

export default SeatCard;
