import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import axios from 'axios';
import SeatLayout from './components/SeatLayout';
import PassengerList from './components/PassengerList';
import { FaBus, FaRoute, FaSyncAlt } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import './index.css';

// Lazy load modal components to reduce initial bundle size
const BookingForm = lazy(() => import('./components/BookingForm'));
const GenderPopup = lazy(() => import('./components/GenderPopup'));
const ConfirmDialog = lazy(() => import('./components/ConfirmDialog'));

function App() {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]); // Array of {seat, gender}
  const [showGenderPopup, setShowGenderPopup] = useState(false);
  const [currentSeat, setCurrentSeat] = useState(null); // Seat for gender popup
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState('Mannar to Colombo');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [seatToCancel, setSeatToCancel] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showStoragePrompt, setShowStoragePrompt] = useState(false);
  const [storageStatus, setStorageStatus] = useState(() => {
    if (typeof window === 'undefined') return 'unknown';
    return localStorage.getItem('storagePermissionStatus') || 'unknown';
  });

  const routes = ['Mannar to Colombo', 'Colombo to Mannar'];
  const storageAllowed = !isMobile || storageStatus === 'granted';
  const storageKey = useMemo(() => `seat-cache-${selectedRoute}-${selectedDate}`, [selectedRoute, selectedDate]);

  // Determine if mobile
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mobile = /Mobi|Android/i.test(window.navigator.userAgent);
    setIsMobile(mobile);
  }, []);

  useEffect(() => {
    if (isMobile && storageStatus === 'unknown') {
      setShowStoragePrompt(true);
    }
  }, [isMobile, storageStatus]);

  // Load cached seats if available
  useEffect(() => {
    if (!storageAllowed || typeof window === 'undefined') return;
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length) {
          setSeats(parsed);
        }
      } catch (err) {
        console.warn('Failed to parse cached seats', err);
      }
    }
  }, [storageAllowed, storageKey]);

  // Initialize seats on first load
  useEffect(() => {
    const initializeSeats = async () => {
      try {
        await axios.post(`/api/seats/initialize?date=${selectedDate}`);
        setInitialized(true);
      } catch (error) {
        console.error('Error initializing seats:', error);
        setInitialized(true); // Continue even if already initialized
      }
    };

    initializeSeats();
  }, [selectedDate]);

  // Fetch seats when route or date changes
  useEffect(() => {
    if (initialized) {
      fetchSeats();
    }
  }, [selectedRoute, selectedDate, initialized]);

  const fetchSeats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/seats?route=${selectedRoute}&date=${selectedDate}`);
      if (response.data.success) {
        setSeats(response.data.data);
        if (storageAllowed && typeof window !== 'undefined') {
          localStorage.setItem(storageKey, JSON.stringify(response.data.data));
        }
      }
    } catch (error) {
      console.error('Error fetching seats:', error);
      alert('Error loading seats. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, [selectedRoute, selectedDate, storageAllowed, storageKey]);

  const handleSeatClick = useCallback((seat) => {
    if (seat.isBooked) {
      // If booked, show edit form
      setSelectedSeats([{ seat, gender: seat.gender }]);
      setShowBookingForm(true);
      return;
    }

    const isAlreadySelected = selectedSeats.some(({ seat: selectedSeat }) => selectedSeat._id === seat._id);

    if (isAlreadySelected) {
      // Deselect seat if clicked again
      setSelectedSeats(prev => prev.filter(({ seat: selectedSeat }) => selectedSeat._id !== seat._id));
      return;
    }

    // If available and not selected yet, show gender popup
    setCurrentSeat(seat);
    setShowGenderPopup(true);
  }, [selectedSeats]);

  const handleGenderSelect = useCallback((seat, gender) => {
    // Add seat with gender to selection (prevent duplicates)
    setSelectedSeats(prev => {
      const alreadySelected = prev.some(({ seat: selectedSeat }) => selectedSeat._id === seat._id);
      if (alreadySelected) {
        return prev;
      }
      return [...prev, { seat, gender }];
    });
    setShowGenderPopup(false);
    setCurrentSeat(null);
  }, []);

  const handleGenderPopupClose = useCallback(() => {
    setShowGenderPopup(false);
    setCurrentSeat(null);
  }, []);

  const handleBooking = useCallback(async (formData) => {
    try {
      // Book all selected seats
      for (const { seat, gender } of selectedSeats) {
        await axios.post(
          `/api/seats/${seat._id}/book`,
          { ...formData, gender }
        );
      }

      await fetchSeats();
      setSelectedSeats([]);
      setShowBookingForm(false);
      // Seats booked successfully - no alert needed
    } catch (error) {
      console.error('Error booking seat:', error);
      alert(error.response?.data?.message || 'Error booking seat');
      throw error;
    }
  }, [selectedSeats, fetchSeats]);

  const handleUpdateBooking = useCallback(async (formData) => {
    try {
      const { seat, gender } = selectedSeats[0];
      const response = await axios.put(
        `/api/seats/${seat._id}/update`,
        { ...formData, gender }
      );

      if (response.data.success) {
        await fetchSeats();
        setSelectedSeats([]);
        setShowBookingForm(false);
        // Booking updated successfully - no alert needed
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert(error.response?.data?.message || 'Error updating booking');
      throw error;
    }
  }, [selectedSeats, fetchSeats]);

  const handleCancelBooking = useCallback(async (seat) => {
    setSeatToCancel(seat);
    setShowConfirmDialog(true);
  }, []);

  const handleTogglePickup = useCallback(async (seat) => {
    try {
      await axios.patch(`/api/seats/${seat._id}/pickup`, { isPickedUp: !seat.isPickedUp });
      await fetchSeats();
    } catch (error) {
      console.error('Error updating pickup status:', error);
      alert(error.response?.data?.message || 'Error updating pickup status');
    }
  }, [fetchSeats]);

  const requestStoragePermission = async (allow) => {
    if (typeof window === 'undefined') return;
    if (!allow) {
      localStorage.setItem('storagePermissionStatus', 'denied');
      setStorageStatus('denied');
      setShowStoragePrompt(false);
      return;
    }

    try {
      let granted = true;
      if (navigator.storage?.persist) {
        granted = await navigator.storage.persist();
      }
      const status = granted ? 'granted' : 'denied';
      localStorage.setItem('storagePermissionStatus', status);
      setStorageStatus(status);
    } catch (error) {
      console.error('Storage permission error:', error);
      localStorage.setItem('storagePermissionStatus', 'denied');
      setStorageStatus('denied');
    } finally {
      setShowStoragePrompt(false);
    }
  };

  const handleDownloadPassengersCSV = () => {
    const booked = seats.filter(seat => seat.isBooked);
    if (!booked.length) {
      alert('No passengers to download yet.');
      return;
    }

    const headers = ['Seat Number', 'Passenger Name', 'Phone', 'Boarding Point', 'Gender', 'Picked Up'];
    const escape = (value) => {
      const safe = value === undefined || value === null ? '' : String(value);
      return `"${safe.replace(/"/g, '""')}"`;
    };
    const rows = booked.map(seat => [
      seat.seatNumber,
      seat.passengerName || 'Guest',
      seat.passengerPhone || '',
      seat.boardingPoint || '',
      seat.gender || '',
      seat.isPickedUp ? 'Yes' : 'No'
    ].map(escape).join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const routeSlug = selectedRoute.replace(/\s+/g, '-').toLowerCase();
    link.href = url;
    link.download = `passengers-${routeSlug}-${selectedDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPassengersPDF = () => {
    const booked = seats.filter(seat => seat.isBooked);
    if (!booked.length) {
      alert('No passengers to download yet.');
      return;
    }

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margin = 12;
    let currentY = margin;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pickedCount = booked.filter(seat => seat.isPickedUp).length;

    const addSummary = () => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Passenger Details', margin, currentY);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      currentY += 8;
      doc.text(`Route: ${selectedRoute}`, margin, currentY);
      currentY += 6;
      doc.text(`Date: ${selectedDate}`, margin, currentY);
      currentY += 6;
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, currentY);
      currentY += 6;
      doc.text(`Passengers: ${booked.length} | Picked up: ${pickedCount}`, margin, currentY);
      currentY += 10;
    };

    const columns = [
      { key: 'seatNumber', title: 'Seat', width: 18, align: 'left', format: (seat) => `#${seat.seatNumber}` },
      { key: 'passengerName', title: 'Passenger', width: 40, align: 'left', format: (seat) => seat.passengerName || 'Guest' },
      { key: 'passengerPhone', title: 'Phone', width: 28, align: 'left', format: (seat) => seat.passengerPhone || '-' },
      { key: 'boardingPoint', title: 'Boarding', width: 48, align: 'left', format: (seat) => seat.boardingPoint || '-' },
      { key: 'gender', title: 'Gender', width: 20, align: 'center', format: (seat) => seat.gender ? seat.gender[0].toUpperCase() + seat.gender.slice(1) : '-' },
      { key: 'status', title: 'Picked', width: 22, align: 'center', format: (seat) => (seat.isPickedUp ? 'Yes' : 'No') }
    ];

    const drawTableHeader = () => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      let x = margin;
      doc.setFillColor(30, 41, 59);
      doc.setTextColor(255);
      const headerHeight = 8;
      doc.rect(margin, currentY, columns.reduce((sum, col) => sum + col.width, 0), headerHeight, 'F');
      columns.forEach((col) => {
        doc.text(col.title, x + 1, currentY + 5);
        x += col.width;
      });
      doc.setTextColor(0);
      doc.setFont('helvetica', 'normal');
      currentY += headerHeight;
    };

    const drawRow = (seat) => {
      const rowHeight = 8;
      if (currentY + rowHeight > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
        addSummary();
        drawTableHeader();
      }

      let x = margin;
      columns.forEach(col => {
        const text = col.format(seat);
        doc.text(text, col.align === 'center' ? x + col.width / 2 : x + 1, currentY + 5, { align: col.align });
        x += col.width;
      });
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, currentY + rowHeight, margin + columns.reduce((sum, col) => sum + col.width, 0), currentY + rowHeight);
      currentY += rowHeight;
    };

    addSummary();
    drawTableHeader();
    booked.forEach(drawRow);

    if (booked.length > 0) {
      const completedPercentage = Math.round((pickedCount / booked.length) * 100);
      if (currentY + 12 > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }
      currentY += 4;
      doc.setFont('helvetica', 'italic');
      doc.text(`Pickup Completion: ${completedPercentage}%`, margin, currentY);
    }

    const routeSlug = selectedRoute.replace(/\s+/g, '-').toLowerCase();
    doc.save(`passengers-${routeSlug}-${selectedDate}.pdf`);
  };

  const confirmCancelBooking = async () => {
    if (!seatToCancel) return;

    try {
      const response = await axios.delete(`/api/seats/${seatToCancel._id}/cancel`);

      if (response.data.success) {
        await fetchSeats();
        setShowConfirmDialog(false);
        setSeatToCancel(null);
        // Booking cancelled successfully - no alert needed
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(error.response?.data?.message || 'Error cancelling booking');
    }
  };

  const handleFormSubmit = (formData) => {
    if (selectedSeat.isBooked) {
      return handleUpdateBooking(formData);
    } else {
      return handleBooking(formData);
    }
  };

  const bookedCount = useMemo(() => seats.filter(seat => seat.isBooked).length, [seats]);
  const availableCount = useMemo(() => seats.length - bookedCount, [seats.length, bookedCount]);
  const bookedSeats = useMemo(() => seats.filter(s => s.isBooked), [seats]);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-effect p-6 mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600/30 p-4 rounded-xl border border-blue-500/50">
                <FaBus className="text-4xl text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-shadow bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  Bus Seat Reservation
                </h1>
                <p className="text-white/70 mt-1">Conductor Management System</p>
              </div>
            </div>

            {/* Route Selector & Controls */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              {/* Route - Modern Segmented Control */}
              <div className="relative">
                <div className="flex items-center gap-2 bg-slate-800/50 p-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-blue-300 px-2">
                    <FaRoute className="text-lg" />
                    <span className="font-semibold text-xs md:text-sm hidden sm:inline">Route:</span>
                  </div>
                  <div className="relative flex bg-slate-900/50 rounded-lg p-1">
                    {routes.map((route, index) => {
                      const isSelected = selectedRoute === route;
                      const routeParts = route.split(' to ');
                      return (
                        <button
                          key={route}
                          onClick={() => {
                            setSelectedRoute(route);
                            setSelectedSeats([]);
                          }}
                          className={`relative px-3 py-1.5 md:px-4 md:py-2 rounded-md text-xs md:text-sm font-semibold 
                                    transition-all duration-300 ease-out whitespace-nowrap
                                    ${isSelected
                              ? 'text-white shadow-lg'
                              : 'text-white/60 hover:text-white/80'
                            }`}
                        >
                          {/* Animated background for selected route */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-md 
                                          shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-fade-in" />
                          )}

                          {/* Route text */}
                          <span className="relative z-10 flex items-center gap-1">
                            <span className="hidden sm:inline">{routeParts[0]}</span>
                            <span className="sm:hidden">{routeParts[0].substring(0, 3)}</span>
                            <span className="text-[10px] md:text-xs opacity-70">→</span>
                            <span className="hidden sm:inline">{routeParts[1]}</span>
                            <span className="sm:hidden">{routeParts[1].substring(0, 3)}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Date - Enhanced Styling */}
              <div className="flex items-center gap-2 bg-slate-800/50 p-2 md:p-2.5 rounded-xl border border-white/10 backdrop-blur-sm hover:border-white/20 transition-colors">
                <span className="font-semibold text-blue-300 text-xs md:text-sm hidden md:inline">Date:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSeats([]);
                    setShowBookingForm(false);
                  }}
                  className="bg-transparent border-none focus:ring-0 text-white font-medium text-xs md:text-sm cursor-pointer 
                           [color-scheme:dark] focus:outline-none"
                />
              </div>

              {/* Refresh - Enhanced Styling */}
              <button
                onClick={fetchSeats}
                className="p-2 md:p-2.5 bg-gradient-to-br from-blue-600/20 to-blue-700/20 hover:from-blue-600/40 hover:to-blue-700/40 
                         rounded-xl border border-blue-500/30 transition-all duration-200 
                         hover:scale-105 active:scale-95 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]
                         group"
                title="Refresh"
              >
                <FaSyncAlt className="text-blue-300 group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="glass-card p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{seats.length}</div>
              <div className="text-sm text-white/70 mt-1">Total Seats</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{bookedCount}</div>
              <div className="text-sm text-white/70 mt-1">Booked</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-3xl font-bold text-slate-400">{availableCount}</div>
              <div className="text-sm text-white/70 mt-1">Available</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-3xl font-bold text-yellow-400">
                {seats.length > 0 ? Math.round((bookedCount / seats.length) * 100) : 0}%
              </div>
              <div className="text-sm text-white/70 mt-1">Occupancy</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 
                            rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/70">Loading seats...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Seat Layout */}
            <div className="lg:col-span-2">
              {seats.length > 0 ? (
                <SeatLayout seats={seats} onSeatClick={handleSeatClick} />
              ) : (
                <div className="glass-effect p-12 text-center">
                  <p className="text-white/50 text-lg">No seats available for this route</p>
                </div>
              )}

              {/* Booking Form */}
              {showBookingForm && selectedSeats.length > 0 && (
                <div className="mt-6">
                  <Suspense fallback={
                    <div className="glass-effect p-6 animate-pulse">
                      <div className="h-8 bg-white/10 rounded mb-4"></div>
                      <div className="h-12 bg-white/10 rounded mb-3"></div>
                      <div className="h-12 bg-white/10 rounded mb-3"></div>
                      <div className="h-12 bg-white/10 rounded"></div>
                    </div>
                  }>
                    <BookingForm
                      seat={selectedSeats[0].seat}
                      selectedSeats={selectedSeats}
                      selectedRoute={selectedRoute}
                      onSubmit={selectedSeats[0].seat.isBooked ? handleUpdateBooking : handleBooking}
                      onCancel={() => {
                        setSelectedSeats([]);
                        setShowBookingForm(false);
                      }}
                    />
                  </Suspense>
                </div>
              )}

              {/* Book Selected Seats Button */}
              {selectedSeats.length > 0 && !showBookingForm && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowBookingForm(true)}
                    className="w-full btn-primary py-4 text-lg"
                  >
                    Book {selectedSeats.length} Selected Seat{selectedSeats.length > 1 ? 's' : ''}
                  </button>
                  <button
                    onClick={() => setSelectedSeats([])}
                    className="w-full btn-secondary py-2 text-sm mt-2"
                  >
                    Clear Selection
                  </button>
                </div>
              )}
            </div>

            {/* Right: Passenger List */}
            <div>
              <PassengerList
                seats={bookedSeats}
                onEdit={handleSeatClick}
                onCancel={handleCancelBooking}
                onTogglePickup={handleTogglePickup}
                onDownloadCsv={isMobile ? handleDownloadPassengersCSV : undefined}
                onDownloadPdf={isMobile ? handleDownloadPassengersPDF : undefined}
                isMobile={isMobile}
              />
            </div>
          </div>
        )}

        {/* Gender Popup */}
        {showGenderPopup && (
          <Suspense fallback={null}>
            <GenderPopup
              seat={currentSeat}
              onSelect={handleGenderSelect}
              onClose={handleGenderPopupClose}
            />
          </Suspense>
        )}

        {/* Confirm Dialog */}
        {showConfirmDialog && seatToCancel && (
          <Suspense fallback={null}>
            <ConfirmDialog
              isOpen={showConfirmDialog}
              title="Cancel Booking"
              message={`Are you sure you want to cancel the booking for ${seatToCancel.passengerName} (Seat #${seatToCancel.seatNumber})?`}
              confirmText="Yes, Cancel"
              cancelText="No, Keep It"
              onConfirm={confirmCancelBooking}
              onCancel={() => {
                setShowConfirmDialog(false);
                setSeatToCancel(null);
              }}
            />
          </Suspense>
        )}

        {/* Storage Permission Prompt */}
        {showStoragePrompt && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="glass-effect p-5 w-full max-w-md animate-slide-up">
              <h3 className="text-xl font-semibold mb-3">Storage Permission</h3>
              <p className="text-white/80 text-sm mb-4">
                We can save passenger data on your device for offline access. Allow storage on this mobile device?
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  className="btn-secondary"
                  onClick={() => requestStoragePermission(false)}
                >
                  Not now
                </button>
                <button
                  className="btn-primary"
                  onClick={() => requestStoragePermission(true)}
                >
                  Allow storage
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
