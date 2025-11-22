import React, { memo, useMemo } from 'react';
import SeatCard from './SeatCard';
import { MdAirlineSeatReclineNormal } from 'react-icons/md';

const SeatLayout = memo(({ seats, onSeatClick, selectedSeats = [] }) => {
    // Memoize seat separation and row calculations
    const { standardRows, backRowSeats } = useMemo(() => {
        if (!seats || seats.length === 0) return { standardRows: [], backRowSeats: [] };

        // Sort seats by seat number just in case
        const sortedSeats = [...seats].sort((a, b) => a.seatNumber - b.seatNumber);
        const totalSeats = sortedSeats.length;

        // The last 5 seats are always the back row
        const backRowStartIndex = Math.max(0, totalSeats - 5);

        const standardSeats = sortedSeats.slice(0, backRowStartIndex);
        const backRowSeats = sortedSeats.slice(backRowStartIndex);

        // Group standard seats into rows
        const standardRows = [];

        // Standard rows are chunks of 4
        for (let i = 0; i < standardSeats.length; i += 4) {
            standardRows.push(standardSeats.slice(i, i + 4));
        }

        return { standardRows, backRowSeats };
    }, [seats]);

    return (
        <div className="glass-effect p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
                <MdAirlineSeatReclineNormal className="text-2xl md:text-3xl text-blue-400" />
                <h2 className="text-xl md:text-2xl font-bold text-shadow">Bus Layout</h2>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 md:gap-4 mb-4 md:mb-6 text-xs md:text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-slate-700/50 border border-slate-600 rounded"></div>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-600/40 border border-blue-500 rounded"></div>
                    <span>Male</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-pink-600/40 border border-pink-500 rounded"></div>
                    <span>Female</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-[10px] md:text-xs">Window</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-[10px] md:text-xs">Aisle</span>
                </div>
            </div>

            {/* Driver indicator at the front - Aligned to Right */}
            <div className="mb-4 md:mb-6 flex gap-2 md:gap-3 justify-center items-center">
                {/* Empty left side */}
                <div className="flex gap-1.5 md:gap-2">
                    <div className="w-10 h-10 md:w-[60px] md:h-[60px]"></div>
                    <div className="w-10 h-10 md:w-[60px] md:h-[60px]"></div>
                </div>

                {/* Aisle */}
                <div className="w-6 md:w-8"></div>

                {/* Driver Seat */}
                <div className="flex gap-1.5 md:gap-2 justify-end w-[86px] md:w-[128px]"> {/* Width matches 2 seats + gap */}
                    <div className="glass-card px-2 py-1 md:px-3 md:py-2 text-[10px] md:text-xs text-blue-300 font-semibold border-blue-500/30 bg-blue-900/20 w-full text-center">
                        Driver
                    </div>
                </div>
            </div>

            {/* Seat Grid */}
            <div className="space-y-2 md:space-y-3">
                {/* Standard rows (2-2 layout) */}
                {standardRows.map((row, rowIndex) => {
                    // Check if this is a partial row (less than 4 seats)
                    const isPartialRow = row.length < 4;

                    if (isPartialRow) {
                        // Render partial row on the RIGHT side
                        return (
                            <div key={rowIndex} className="flex gap-2 md:gap-3 justify-center items-center">
                                {/* Empty left side */}
                                <div className="flex gap-1.5 md:gap-2">
                                    <div className="w-10 h-10 md:w-[60px] md:h-[60px]"></div>
                                    <div className="w-10 h-10 md:w-[60px] md:h-[60px]"></div>
                                </div>

                                {/* Aisle */}
                                <div className="w-6 md:w-8 flex items-center justify-center">
                                    <div className="h-full w-1 bg-gradient-to-b from-transparent via-blue-500/30 to-transparent"></div>
                                </div>

                                {/* Right seats */}
                                <div className="flex gap-1.5 md:gap-2">
                                    {row.map((seat) => (
                                        <SeatCard
                                            key={`${seat._id}-${seat.isBooked}`}
                                            seat={seat}
                                            onClick={onSeatClick}
                                            isSelected={selectedSeats.some(({ seat: s }) => s._id === seat._id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    // Regular 2-2 row
                    return (
                        <div key={rowIndex} className="flex gap-2 md:gap-3 justify-center items-center">
                            {/* Left seats (2 seats) */}
                            <div className="flex gap-1.5 md:gap-2">
                                {row.slice(0, 2).map((seat) => (
                                    <SeatCard
                                        key={`${seat._id}-${seat.isBooked}`}
                                        seat={seat}
                                        onClick={onSeatClick}
                                        isSelected={selectedSeats.some(({ seat: s }) => s._id === seat._id)}
                                    />
                                ))}
                            </div>

                            {/* Aisle */}
                            <div className="w-6 md:w-8 flex items-center justify-center">
                                <div className="h-full w-1 bg-gradient-to-b from-transparent via-blue-500/30 to-transparent"></div>
                            </div>

                            {/* Right seats (2 seats) */}
                            <div className="flex gap-1.5 md:gap-2">
                                {row.slice(2, 4).map((seat) => (
                                    <SeatCard
                                        key={`${seat._id}-${seat.isBooked}`}
                                        seat={seat}
                                        onClick={onSeatClick}
                                        isSelected={selectedSeats.some(({ seat: s }) => s._id === seat._id)}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Back row (5 seats) */}
                {backRowSeats.length > 0 && (
                    <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/10">
                        <div className="flex gap-1.5 md:gap-2 justify-center items-center">
                            {backRowSeats.map((seat) => (
                                <SeatCard
                                    key={`${seat._id}-${seat.isBooked}`}
                                    seat={seat}
                                    onClick={onSeatClick}
                                    isSelected={selectedSeats.some(({ seat: s }) => s._id === seat._id)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

SeatLayout.displayName = 'SeatLayout';

export default SeatLayout;
