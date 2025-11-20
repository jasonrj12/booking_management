import React from 'react';
import { FaTimes } from 'react-icons/fa';

const GenderPopup = ({ seat, onSelect, onClose }) => {
    if (!seat) return null;

    const handleGenderSelect = (gender) => {
        onSelect(seat, gender);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
            <div className="glass-effect p-6 rounded-xl max-w-md w-full mx-4 animate-slide-up">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-shadow">
                        Select Gender - Seat #{seat.seatNumber}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white transition-colors"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Male Button */}
                    <button
                        onClick={() => handleGenderSelect('male')}
                        className="w-full p-6 bg-blue-600/40 border-2 border-blue-500 rounded-lg hover:bg-blue-500/50 transition-all transform hover:scale-105 flex items-center justify-center gap-3"
                    >
                        <div className="w-6 h-6 rounded-full border-2 border-blue-400 bg-blue-500 flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                        <span className="text-2xl font-bold">Male</span>
                    </button>

                    {/* Female Button */}
                    <button
                        onClick={() => handleGenderSelect('female')}
                        className="w-full p-6 bg-pink-600/40 border-2 border-pink-500 rounded-lg hover:bg-pink-500/50 transition-all transform hover:scale-105 flex items-center justify-center gap-3"
                    >
                        <div className="w-6 h-6 rounded-full border-2 border-pink-400 bg-pink-500 flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                        <span className="text-2xl font-bold">Female</span>
                    </button>
                </div>

                <div className="mt-6 text-center text-sm text-white/60">
                    Click a gender to select this seat
                </div>
            </div>
        </div>
    );
};

export default GenderPopup;
