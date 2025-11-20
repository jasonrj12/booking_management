import React from 'react';
import { FaUser, FaPhone, FaTrash, FaEdit, FaMapMarkerAlt, FaUserCheck } from 'react-icons/fa';

const PassengerList = ({ seats, onEdit, onCancel, onTogglePickup, onDownloadCsv, onDownloadPdf, isMobile }) => {
    const bookedSeats = seats.filter(seat => seat.isBooked);

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
                    {bookedSeats.map((seat) => (
                        <div
                            key={seat._id}
                            className="glass-card p-3 md:p-4 hover:bg-white/15 transition-all duration-200"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                                        <div className="bg-green-600/30 px-2 py-1 md:px-3 md:py-1 rounded-lg border border-green-500/50 font-bold text-base md:text-lg">
                                            #{seat.seatNumber}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-base md:text-lg flex items-center gap-2">
                                                <FaUser className="text-xs md:text-sm text-blue-300" />
                                                {seat.passengerName || <span className="text-white/50 italic">Guest</span>}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full border ${seat.isPickedUp
                                                    ? 'bg-green-500/20 border-green-400/60 text-green-200'
                                                    : 'bg-yellow-500/10 border-yellow-400/60 text-yellow-100'}`}>
                                                    {seat.isPickedUp ? 'Picked up' : 'Waiting'}
                                                </span>
                                            </div>
                                            <div className="text-xs md:text-sm text-white/70 flex items-center gap-2 mt-0.5">
                                                <FaMapMarkerAlt className="text-[10px] md:text-xs text-red-300" />
                                                {seat.boardingPoint || <span className="text-white/40 italic">No boarding point</span>}
                                            </div>
                                            <div className="text-xs md:text-sm text-white/70 flex items-center gap-2">
                                                <FaPhone className="text-[10px] md:text-xs text-green-300" />
                                                {seat.passengerPhone}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-[10px] md:text-xs text-white/50 mt-1 md:mt-2">
                                        Row {seat.rowNumber} • {seat.position}
                                    </div>
                                </div>

                                <div className="flex gap-2 ml-2 md:ml-3">
                                    <button
                                        onClick={() => onTogglePickup(seat)}
                                        className={`p-1.5 md:p-2 rounded-lg border transition-all duration-200 hover:scale-110 ${seat.isPickedUp
                                            ? 'bg-emerald-600/30 hover:bg-emerald-600/50 border-emerald-500/50'
                                            : 'bg-yellow-500/20 hover:bg-yellow-500/40 border-yellow-400/40'}`}
                                        title={seat.isPickedUp ? 'Mark as waiting' : 'Mark as picked up'}
                                    >
                                        <FaUserCheck className="text-sm md:text-base text-white" />
                                    </button>
                                    <a
                                        href={`tel:${seat.passengerPhone}`}
                                        className="p-1.5 md:p-2 bg-green-600/30 hover:bg-green-600/50 rounded-lg 
                             border border-green-500/50 transition-all duration-200 
                             hover:scale-110 flex items-center justify-center"
                                        title="Call passenger"
                                    >
                                        <FaPhone className="text-sm md:text-base text-green-300" />
                                    </a>
                                    <button
                                        onClick={() => onEdit(seat)}
                                        className="p-1.5 md:p-2 bg-blue-600/30 hover:bg-blue-600/50 rounded-lg 
                             border border-blue-500/50 transition-all duration-200 
                             hover:scale-110"
                                        title="Edit booking"
                                    >
                                        <FaEdit className="text-sm md:text-base text-blue-300" />
                                    </button>
                                    <button
                                        onClick={() => onCancel(seat)}
                                        className="p-1.5 md:p-2 bg-red-600/30 hover:bg-red-600/50 rounded-lg 
                             border border-red-500/50 transition-all duration-200 
                             hover:scale-110"
                                        title="Cancel booking"
                                    >
                                        <FaTrash className="text-sm md:text-base text-red-300" />
                                    </button>
                                </div>
                            </div>
                        </div>
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
};

export default PassengerList;
