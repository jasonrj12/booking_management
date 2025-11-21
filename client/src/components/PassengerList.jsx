import React, { memo, useMemo } from 'react';
import { FaUser, FaPhone, FaTrash, FaEdit, FaMapMarkerAlt, FaUserCheck } from 'react-icons/fa';

// Memoized PassengerCard component to prevent unnecessary re-renders
const PassengerCard = memo(({ passenger, onEdit, onCancel, onTogglePickup }) => {
    // Use first seat for actions
    const firstSeat = passenger.seats[0];
    const seatNumbers = passenger.seats.map(s => s.seatNumber).sort((a, b) => a - b);

    return (
        <div className="glass-card p-3 md:p-4 hover:bg-white/15 transition-all duration-200">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    {/* Seat Numbers and Name Row */}
                    <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                        <div className="flex gap-1.5">
                            {seatNumbers.map((seatNum, index) => (
                                <div key={seatNum} className="bg-green-600/30 px-2 py-1 md:px-3 md:py-1 rounded-lg border border-green-500/50 font-bold text-sm md:text-base">
                                    #{seatNum}
                                </div>
                            ))}
                        </div>
                        <div className="font-semibold text-base md:text-lg flex items-center gap-2">
                            <FaUser className="text-xs md:text-sm text-blue-300" />
                            {passenger.passengerName || <span className="text-white/50 italic">Guest</span>}
                        </div>
                    </div>

                    {/* Status Badge Row */}
                    <div className="mb-1.5">
                        <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full border inline-block ${passenger.isPickedUp
                            ? 'bg-green-500/20 border-green-400/60 text-green-200'
                            : 'bg-yellow-500/10 border-yellow-400/60 text-yellow-100'}`}>
                            {passenger.isPickedUp ? 'Picked up' : 'Waiting'}
                        </span>
                        {passenger.seats.length > 1 && (
                            <span className="text-[10px] md:text-xs px-2 py-0.5 ml-2 rounded-full border border-blue-400/60 bg-blue-500/20 text-blue-200 inline-block">
                                {passenger.seats.length} seats
                            </span>
                        )}
                    </div>

                    {/* Boarding Point Row */}
                    <div className="text-xs md:text-sm text-white/70 flex items-center gap-2 mb-1">
                        <FaMapMarkerAlt className="text-[10px] md:text-xs text-red-300" />
                        {passenger.boardingPoint || <span className="text-white/40 italic">No boarding point</span>}
                    </div>

                    {/* Phone Number Row */}
                    <div className="text-xs md:text-sm text-white/70 flex items-center gap-2 mb-1.5">
                        <FaPhone className="text-[10px] md:text-xs text-green-300" />
                        {passenger.passengerPhone}
                    </div>

                    {/* Row and Position Info */}
                    <div className="text-[10px] md:text-xs text-white/50">
                        {passenger.seats.length === 1 ? (
                            `Row ${firstSeat.rowNumber} • ${firstSeat.position}`
                        ) : (
                            `${passenger.seats.length} seats booked`
                        )}
                    </div>
                </div>

                <div className="flex gap-2 ml-2 md:ml-3">
                    <button
                        onClick={() => onTogglePickup(firstSeat)}
                        className={`p-1.5 md:p-2 rounded-lg border transition-all duration-200 hover:scale-110 ${passenger.isPickedUp
                            ? 'bg-emerald-600/30 hover:bg-emerald-600/50 border-emerald-500/50'
                            : 'bg-yellow-500/20 hover:bg-yellow-500/40 border-yellow-400/40'}`}
                        title={passenger.isPickedUp ? 'Mark as waiting' : 'Mark as picked up'}
                    >
                        <FaUserCheck className="text-sm md:text-base text-white" />
                    </button>
                    <a
                        href={`tel:${passenger.passengerPhone}`}
                        className="p-1.5 md:p-2 bg-green-600/30 hover:bg-green-600/50 rounded-lg 
                              border border-green-500/50 transition-all duration-200 
                              hover:scale-110 flex items-center justify-center"
                        title="Call passenger"
                    >
                        <FaPhone className="text-sm md:text-base text-green-300" />
                    </a>
                    <button
                        onClick={() => onEdit(firstSeat)}
                        className="p-1.5 md:p-2 bg-blue-600/30 hover:bg-blue-600/50 rounded-lg 
                              border border-blue-500/50 transition-all duration-200 
                              hover:scale-110"
                        title="Edit booking"
                    >
                        <FaEdit className="text-sm md:text-base text-blue-300" />
                    </button>
                    <button
                        onClick={() => onCancel(passenger)}
                        className="p-1.5 md:p-2 bg-red-600/30 hover:bg-red-600/50 rounded-lg 
                              border border-red-500/50 transition-all duration-200 
                              hover:scale-110"
                        title={passenger.seats.length > 1 ? `Cancel ${passenger.seats.length} bookings` : 'Cancel booking'}
                    >
                        <FaTrash className="text-sm md:text-base text-red-300" />
                    </button>
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

const PassengerList = memo(({ seats, onEdit, onCancel, onTogglePickup, onDownloadCsv, onDownloadPdf, isMobile }) => {
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
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-shadow">
                    Passenger List
                </h2>
                <div className="flex items-center gap-2">
                    {isMobile && (
                        <>
                            {onDownloadCsv && (
                                <button
                                    onClick={onDownloadCsv}
                                    className="text-xs md:text-sm px-2 py-1 rounded-lg border border-blue-500/40 bg-blue-600/20 hover:bg-blue-600/40 transition-colors disabled:opacity-50"
                                    disabled={bookedSeats.length === 0}
                                >
                                    CSV
                                </button>
                            )}
                            {onDownloadPdf && (
                                <button
                                    onClick={onDownloadPdf}
                                    className="text-xs md:text-sm px-2 py-1 rounded-lg border border-purple-500/40 bg-purple-600/20 hover:bg-purple-600/40 transition-colors disabled:opacity-50"
                                    disabled={bookedSeats.length === 0}
                                >
                                    PDF
                                </button>
                            )}
                        </>
                    )}
                    <div className="bg-blue-600/30 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-blue-500/50">
                        <span className="text-base md:text-lg font-bold">{bookedSeats.length}</span>
                        <span className="text-xs md:text-sm text-blue-200 ml-1">Booked</span>
                    </div>
                </div>
            </div>

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
                            onCancel={onCancel}
                            onTogglePickup={onTogglePickup}
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
