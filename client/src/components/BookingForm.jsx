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
                    {/* Passenger Name */}
                    <div>
                        <label className="block text-sm font-medium mb-1 md:mb-2 text-blue-200">
                            <FaUser className="inline mr-2" />
                            Passenger Name <span className="text-white/50 text-xs">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            name="passengerName"
                            value={formData.passengerName}
                            onChange={handleChange}
                            className={`input-field ${errors.passengerName ? 'border-red-500 ring-2 ring-red-500' : ''}`}
                            placeholder="Enter passenger name"
                        />
                        {errors.passengerName && (
                            <p className="text-red-400 text-sm mt-1">{errors.passengerName}</p>
                        )}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium mb-1 md:mb-2 text-blue-200">
                            <FaPhone className="inline mr-2" />
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="passengerPhone"
                            value={formData.passengerPhone}
                            onChange={handleChange}
                            className={`input-field ${errors.passengerPhone ? 'border-red-500 ring-2 ring-red-500' : ''}`}
                            placeholder="Enter 10-digit phone number"
                            maxLength={10}
                        />
                        {errors.passengerPhone && (
                            <p className="text-red-400 text-sm mt-1">{errors.passengerPhone}</p>
                        )}
                    </div>

                    {/* Boarding Point */}
                    {(selectedRoute === 'Mannar to Colombo' || selectedRoute === 'Colombo to Mannar') && (
                        <div>
                            <label className="block text-sm font-medium mb-1 md:mb-2 text-blue-200">
                                <FaMapMarkerAlt className="inline mr-2" />
                                Boarding Point
                            </label>
                            <select
                                name="boardingPoint"
                                value={formData.boardingPoint}
                                onChange={handleChange}
                                className="input-field appearance-none cursor-pointer"
                            >
                                <option value="">Select Boarding Point</option>
                                {(selectedRoute === 'Mannar to Colombo' ? mannarToColomboBoardingPoints : colomboToMannarBoardingPoints).map((point, index) => (
                                    <option key={index} value={point} className="bg-slate-900 text-white">
                                        {point}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}


                    {/* Gender Selection for Each Seat */}
                    {!seat.isBooked && selectedSeats.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium mb-2 text-blue-200">
                                <FaVenusMars className="inline mr-2" />
                                Gender Selection
                            </label>
                            <div className="space-y-2">
                                {selectedSeats.map(({ seat: selectedSeat, gender }) => (
                                    <div key={selectedSeat._id} className="glass-card p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-600/30 px-3 py-1 rounded-lg border border-blue-500/50 font-bold">
                                                #{selectedSeat.seatNumber}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => onUpdateGender(selectedSeat, 'male')}
                                                    className={`px-3 py-1.5 rounded-lg border-2 transition-all text-sm font-medium ${gender === 'male'
                                                            ? 'bg-blue-600/60 border-blue-400 text-white shadow-lg'
                                                            : 'bg-blue-600/20 border-blue-600/40 text-blue-200 hover:bg-blue-600/40'
                                                        }`}
                                                >
                                                    Male
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onUpdateGender(selectedSeat, 'female')}
                                                    className={`px-3 py-1.5 rounded-lg border-2 transition-all text-sm font-medium ${gender === 'female'
                                                            ? 'bg-pink-600/60 border-pink-400 text-white shadow-lg'
                                                            : 'bg-pink-600/20 border-pink-600/40 text-pink-200 hover:bg-pink-600/40'
                                                        }`}
                                                >
                                                    Female
                                                </button>
                                            </div>
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
