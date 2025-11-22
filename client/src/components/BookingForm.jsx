import React, { useState, useEffect } from 'react';
import { FaUser, FaPhone, FaTimes, FaMapMarkerAlt, FaPlus, FaVenusMars } from 'react-icons/fa';

const mannarToColomboBoardingPoints = [
    "Mannar Bus Stand",
    "Thalladi",
    "Sirunavalkulam",
    "Uyilankulam Post Office",
    "Uyilankulam Petrol Shed",
    "Uyilankulam Kuruchadi",
    "14th Mile Post",
    "Semmanthevu",
    "Murunkan Police Stn",
    "Murunkan Town",
    "Katkadanthakulam",
    "Madu Jn",
    "Manic Farm Seddikulam",
    "Seddikulam",
    "Muthaliyarkulam",
    "Madawachiya",
    "Anuradhapura",
    "Nochchiyagama",
    "Puttalam",
    "Palavi Jn",
    "Madurankuli Jn",
    "Chilaw Roundabout",
    "Chillaw Hospital"
];

const colomboToMannarBoardingPoints = [
    "Mirage Hotel",
    "Bampalapitty Flats Sea Side",
    "Bampalapitty Railway Stn",
    "Galleface Bus Stop Opp Taj Hotel",
    "Pettah Bus Stand",
    "Kettiyawatta Bus Halt",
    "Armour Street DIMO Company",
    "Stadium Petrol Shed",
    "Thotalanga",
    "Peliyagoda Highway Jn",
    "Katunayake Airport Bus Halt After Highway End",
    "Koppara Jn",
    "Periyamulla Jn Opp Al Amra Hotel",
    "Negombo Kochikadai People's Bank",
    "Wennappuwa Police Stn Opp",
    "Maarawila Town",
    "Chillaw Hospital",
    "Chillaw Roundabout",
    "Chillaw Railway Gate",
    "Madurankuli Jn",
    "Palavi Jn",
    "Puttalam"
];

const BookingForm = ({ seat, selectedSeats = [], selectedRoute, onSubmit, onCancel, onAddAnotherSeat, onUpdateGender }) => {
    const [formData, setFormData] = useState({
        passengerName: '',
        passengerPhone: '',
        boardingPoint: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showBoardingDropdown, setShowBoardingDropdown] = useState(false);
    const [boardingSearchTerm, setBoardingSearchTerm] = useState('');

    // Disable background scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Pre-fill form if editing existing booking
    useEffect(() => {
        if (seat && seat.isBooked) {
            setFormData({
                passengerName: seat.passengerName || '',
                passengerPhone: seat.passengerPhone || '',
                boardingPoint: seat.boardingPoint || '',
            });
        }
    }, [seat]);

    // Reset dropdown when route changes
    useEffect(() => {
        setShowBoardingDropdown(false);
        setBoardingSearchTerm('');
    }, [selectedRoute]);

    const validateForm = () => {
        const newErrors = {};

        // Passenger name is now optional - no validation needed

        if (!formData.passengerPhone.trim()) {
            newErrors.passengerPhone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.passengerPhone.replace(/\s/g, ''))) {
            newErrors.passengerPhone = 'Please enter a valid 10-digit phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData);
            setFormData({ passengerName: '', passengerPhone: '', boardingPoint: '' });
            setErrors({});
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    if (!seat) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="glass-effect p-4 md:p-6 animate-slide-up max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 md:mb-6">
                    <h3 className="text-xl md:text-2xl font-bold text-shadow">
                        {seat.isBooked ? 'Edit Booking' : `Book ${selectedSeats.length} Seat${selectedSeats.length > 1 ? 's' : ''}`}
                    </h3>
                    <button
                        onClick={onCancel}
                        className="text-white/60 hover:text-white transition-colors"
                        type="button"
                    >
                        <FaTimes className="text-lg md:text-xl" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                    {/* Compact Selected Seat Display */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center mb-4">
                        <p className="text-blue-200 text-sm">
                            Selected Seat{selectedSeats.length > 1 ? 's' : ''}: <span className="text-white font-bold text-lg ml-1">{selectedSeats.map(s => s.seat.seatNumber).join(', ')}</span>
                        </p>
                    </div>

                    {/* Passenger Name */}
                    <div>
                        <label className="block text-xs font-medium mb-1 text-blue-200 uppercase tracking-wide">
                            Passenger Name <span className="text-white/40 normal-case">(Optional)</span>
                        </label>
                        <div className="relative">
                            <FaUser className="absolute left-3 top-3 text-blue-400/50 text-sm" />
                            <input
                                type="text"
                                name="passengerName"
                                value={formData.passengerName}
                                onChange={handleChange}
                                className={`w-full bg-slate-900/50 border border-blue-500/20 rounded-lg py-2.5 pl-9 pr-3 text-sm text-white placeholder-blue-400/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all ${errors.passengerName ? 'border-red-500/50' : ''}`}
                                placeholder="Enter name"
                            />
                        </div>
                        {errors.passengerName && (
                            <p className="text-red-400 text-xs mt-1">{errors.passengerName}</p>
                        )}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-xs font-medium mb-1 text-blue-200 uppercase tracking-wide">
                            Phone Number
                        </label>
                        <div className="relative">
                            <FaPhone className="absolute left-3 top-3 text-blue-400/50 text-sm" />
                            <input
                                type="tel"
                                name="passengerPhone"
                                value={formData.passengerPhone}
                                onChange={handleChange}
                                className={`w-full bg-slate-900/50 border border-blue-500/20 rounded-lg py-2.5 pl-9 pr-3 text-sm text-white placeholder-blue-400/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all ${errors.passengerPhone ? 'border-red-500/50' : ''}`}
                                placeholder="07XXXXXXXX"
                                maxLength={10}
                            />
                        </div>
                        {errors.passengerPhone && (
                            <p className="text-red-400 text-xs mt-1">{errors.passengerPhone}</p>
                        )}
                    </div>

                    {/* Boarding Point - Custom Searchable Dropdown */}
                    {(selectedRoute === 'Mannar to Colombo' || selectedRoute === 'Colombo to Mannar') && (
                        <div>
                            <label className="block text-xs font-medium mb-1 text-blue-200 uppercase tracking-wide">
                                Boarding Point
                            </label>
                            <div className="relative">
                                <FaMapMarkerAlt className="absolute left-3 top-3 text-blue-400/50 text-sm pointer-events-none z-10" />

                                {/* Search Input */}
                                <input
                                    type="text"
                                    value={boardingSearchTerm || formData.boardingPoint}
                                    onChange={(e) => {
                                        setBoardingSearchTerm(e.target.value);
                                        setShowBoardingDropdown(true);
                                    }}
                                    onFocus={() => setShowBoardingDropdown(true)}
                                    readOnly={/Mobi|Android/i.test(navigator.userAgent)}
                                    className="w-full bg-slate-900/50 border border-blue-500/20 rounded-lg py-2.5 pl-9 pr-3 text-sm text-white placeholder-blue-400/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all cursor-pointer"
                                    placeholder="Search or select boarding point"
                                />

                                {/* Dropdown List */}
                                {showBoardingDropdown && (
                                    <>
                                        {/* Backdrop to close dropdown */}
                                        <div
                                            className="fixed inset-0 z-20"
                                            onClick={() => {
                                                setShowBoardingDropdown(false);
                                                setBoardingSearchTerm('');
                                            }}
                                        />

                                        {/* Options List */}
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-blue-500/30 rounded-lg shadow-2xl max-h-[200px] overflow-y-auto z-30 animate-fade-in">
                                            {(() => {
                                                const points = selectedRoute === 'Mannar to Colombo'
                                                    ? mannarToColomboBoardingPoints
                                                    : colomboToMannarBoardingPoints;

                                                const filtered = points.filter(point =>
                                                    point.toLowerCase().includes((boardingSearchTerm || '').toLowerCase())
                                                );

                                                if (filtered.length === 0) {
                                                    return (
                                                        <div className="px-4 py-3 text-sm text-white/50 text-center">
                                                            No locations found
                                                        </div>
                                                    );
                                                }

                                                return filtered.map((point, index) => (
                                                    <div
                                                        key={index}
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, boardingPoint: point }));
                                                            setShowBoardingDropdown(false);
                                                            setBoardingSearchTerm('');
                                                        }}
                                                        className={`px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-blue-600/20 ${formData.boardingPoint === point
                                                            ? 'bg-blue-600/30 text-blue-200'
                                                            : 'text-white/90'
                                                            }`}
                                                    >
                                                        {point}
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </>
                                )}
                            </div>
                            <p className="text-xs text-white/40 mt-1">
                                {(selectedRoute === 'Mannar to Colombo' ? mannarToColomboBoardingPoints : colomboToMannarBoardingPoints).length} locations available
                            </p>
                        </div>
                    )}

                    {/* Compact Gender Selection */}
                    {!seat.isBooked && selectedSeats.length > 0 && (
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <label className="block text-xs font-medium mb-2 text-blue-200 uppercase tracking-wide flex items-center gap-2">
                                <FaVenusMars /> Gender Selection
                            </label>
                            <div className="space-y-2">
                                {selectedSeats.map(({ seat: selectedSeat, gender }) => (
                                    <div key={selectedSeat._id} className="flex items-center justify-between gap-3">
                                        {selectedSeats.length > 1 && (
                                            <span className="text-blue-300 text-sm font-medium min-w-[60px]">
                                                Seat {selectedSeat.seatNumber}
                                            </span>
                                        )}
                                        <div className="flex gap-2 flex-1">
                                            <button
                                                type="button"
                                                onClick={() => onUpdateGender(selectedSeat, 'male')}
                                                className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition-all border ${gender === 'male'
                                                    ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                                    }`}
                                            >
                                                Male
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onUpdateGender(selectedSeat, 'female')}
                                                className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition-all border ${gender === 'female'
                                                    ? 'bg-pink-600 border-pink-500 text-white shadow-sm'
                                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                                    }`}
                                            >
                                                Female
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add Another Seat Button */}
                    {!seat.isBooked && onAddAnotherSeat && (
                        <div>
                            <button
                                type="button"
                                onClick={onAddAnotherSeat}
                                className="w-full glass-card p-3 border-2 border-dashed border-blue-500/40 hover:border-blue-500/60 hover:bg-blue-600/10 transition-all flex items-center justify-center gap-2 text-blue-300 font-medium"
                            >
                                <FaPlus className="text-sm" />
                                Add Another Seat
                            </button>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex-1 text-sm md:text-base"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Processing...
                                </span>
                            ) : (
                                seat.isBooked ? 'Update Booking' : `Book ${selectedSeats.length} Seat${selectedSeats.length > 1 ? 's' : ''}`
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn-secondary text-sm md:text-base"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingForm;
