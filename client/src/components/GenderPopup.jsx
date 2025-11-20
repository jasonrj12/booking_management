import React from 'react';
import { FaTimes, FaMale, FaFemale } from 'react-icons/fa';

const GenderPopup = ({ seat, onSelect, onClose }) => {
    if (!seat) return null;

    const handleGenderSelect = (gender) => {
        onSelect(seat, gender);
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 animate-fade-in p-0 sm:p-4"
            onClick={onClose}
        >
            <div
                className="glass-effect w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl animate-slide-up overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative p-4 sm:p-6 border-b border-white/10">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-blue-600/30 rounded-full border-2 border-blue-500/50 mb-3">
                            <span className="text-xl sm:text-2xl font-bold text-blue-300">#{seat.seatNumber}</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-shadow mb-1">
                            Select Gender
                        </h3>
                        <p className="text-xs sm:text-sm text-white/60">
                            Choose passenger gender for seat #{seat.seatNumber}
                        </p>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center 
                                 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white 
                                 transition-colors duration-200"
                    >
                        <FaTimes className="text-base sm:text-lg" />
                    </button>
                </div>

                {/* Gender Options */}
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    {/* Male Button */}
                    <button
                        onClick={() => handleGenderSelect('male')}
                        className="w-full p-5 sm:p-6 bg-gradient-to-br from-blue-600/30 to-blue-700/20 
                                 border-2 border-blue-500/50 rounded-2xl hover:from-blue-600/40 hover:to-blue-700/30 
                                 hover:border-blue-400/70 transition-all duration-200 
                                 active:scale-[0.98] flex items-center gap-4 sm:gap-5"
                    >
                        {/* Icon */}
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-500/40 border-2 border-blue-400/60 
                                      flex items-center justify-center">
                            <FaMale className="text-3xl sm:text-4xl text-blue-200" />
                        </div>

                        {/* Text */}
                        <div className="flex-1 text-left">
                            <span className="text-2xl sm:text-3xl font-bold text-white block">Male</span>
                            <span className="text-xs sm:text-sm text-blue-200/70 block mt-1">Select for male passenger</span>
                        </div>

                        {/* Arrow indicator */}
                        <div className="text-blue-300">
                            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>

                    {/* Female Button */}
                    <button
                        onClick={() => handleGenderSelect('female')}
                        className="w-full p-5 sm:p-6 bg-gradient-to-br from-pink-600/30 to-pink-700/20 
                                 border-2 border-pink-500/50 rounded-2xl hover:from-pink-600/40 hover:to-pink-700/30 
                                 hover:border-pink-400/70 transition-all duration-200 
                                 active:scale-[0.98] flex items-center gap-4 sm:gap-5"
                    >
                        {/* Icon */}
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-pink-500/40 border-2 border-pink-400/60 
                                      flex items-center justify-center">
                            <FaFemale className="text-3xl sm:text-4xl text-pink-200" />
                        </div>

                        {/* Text */}
                        <div className="flex-1 text-left">
                            <span className="text-2xl sm:text-3xl font-bold text-white block">Female</span>
                            <span className="text-xs sm:text-sm text-pink-200/70 block mt-1">Select for female passenger</span>
                        </div>

                        {/* Arrow indicator */}
                        <div className="text-pink-300">
                            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>
                </div>

                {/* Footer hint - Mobile optimized */}
                <div className="px-4 sm:px-6 pb-6 sm:pb-6 pt-0">
                    <div className="text-center text-xs sm:text-sm text-white/50 bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                        <span className="inline-block">👆</span> Tap to select gender and continue booking
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenderPopup;
