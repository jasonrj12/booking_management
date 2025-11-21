import React, { useEffect } from 'react';
import { FaUser, FaPhone, FaMapMarkerAlt, FaTimes, FaVenusMars, FaUserCheck, FaTrash, FaEdit } from 'react-icons/fa';

const BookingDetails = ({ seat, onClose, onTogglePickup, onCancel, onEdit }) => {
    // Disable background scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!seat) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="glass-effect p-4 animate-slide-up max-w-sm w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-shadow text-blue-400">
                        Booking Details
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onEdit(seat)}
                            className="text-blue-300 hover:text-blue-100 transition-colors p-1"
                            title="Edit Booking"
                        >
                            <FaEdit className="text-lg" />
                        </button>
                        <button
                            onClick={onClose}
                            className="text-white/60 hover:text-white transition-colors p-1"
                            type="button"
                        >
                            <FaTimes className="text-lg" />
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    {/* Seat Number & Status Row */}
                    <div className="flex gap-2">
                        <div className="glass-card p-2.5 flex-1 flex items-center justify-between">
                            <span className="text-white/70 text-xs font-medium">Seat</span>
                            <div className="bg-blue-600/30 px-2.5 py-0.5 rounded border border-blue-500/50 font-bold text-lg">
                                #{seat.seatNumber}
                            </div>
                        </div>
                        <div className={`glass-card p-2.5 flex-1 flex items-center justify-center border ${seat.isPickedUp
                            ? 'bg-green-500/10 border-green-500/30 text-green-200'
                            : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-100'
                            }`}>
                            <span className="text-xs font-bold uppercase tracking-wide">
                                {seat.isPickedUp ? 'Picked Up' : 'Waiting'}
                            </span>
                        </div>
                    </div>

                    {/* Passenger Name */}
                    <div className="glass-card p-2.5">
                        <div className="flex items-center gap-2 mb-0.5 text-blue-300">
                            <FaUser className="text-xs" />
                            <span className="text-[10px] font-medium uppercase tracking-wider">Passenger</span>
                        </div>
                        <div className="text-sm font-semibold pl-5">
                            {seat.passengerName || 'Guest'}
                        </div>
                    </div>

                    {/* Phone Number with Call Button */}
                    <div className="glass-card p-2.5 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-0.5 text-blue-300">
                                <FaPhone className="text-xs" />
                                <span className="text-[10px] font-medium uppercase tracking-wider">Phone</span>
                            </div>
                            <div className="text-sm font-semibold pl-5 font-mono">
                                {seat.passengerPhone || 'N/A'}
                            </div>
                        </div>
                        {seat.passengerPhone && (
                            <a
                                href={`tel:${seat.passengerPhone}`}
                                className="p-2 bg-green-600/20 hover:bg-green-600/40 border border-green-500/50 rounded-lg text-green-300 transition-colors"
                                title="Call Passenger"
                            >
                                <FaPhone className="text-sm" />
                            </a>
                        )}
                    </div>

                    {/* Boarding Point */}
                    <div className="glass-card p-2.5">
                        <div className="flex items-center gap-2 mb-0.5 text-blue-300">
                            <FaMapMarkerAlt className="text-xs" />
                            <span className="text-[10px] font-medium uppercase tracking-wider">Boarding Point</span>
                        </div>
                        <div className="text-sm font-semibold pl-5 truncate">
                            {seat.boardingPoint || 'N/A'}
                        </div>
                    </div>

                    {/* Gender */}
                    <div className="glass-card p-2.5">
                        <div className="flex items-center gap-2 mb-0.5 text-blue-300">
                            <FaVenusMars className="text-xs" />
                            <span className="text-[10px] font-medium uppercase tracking-wider">Gender</span>
                        </div>
                        <div className="text-sm font-semibold pl-5 capitalize">
                            {seat.gender || 'N/A'}
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                    {/* Toggle Pickup Button */}
                    <button
                        onClick={() => onTogglePickup(seat)}
                        className={`w-full py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${seat.isPickedUp
                            ? 'bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-500/50 text-yellow-100'
                            : 'bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-100'
                            }`}
                    >
                        <FaUserCheck />
                        {seat.isPickedUp ? 'Mark as Waiting' : 'Mark as Picked Up'}
                    </button>

                    {/* Cancel Booking Button */}
                    <button
                        onClick={() => onCancel(seat)}
                        className="w-full py-2 rounded-lg font-medium text-sm bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-200 flex items-center justify-center gap-2 transition-all"
                    >
                        <FaTrash className="text-xs" />
                        Cancel Booking
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingDetails;
