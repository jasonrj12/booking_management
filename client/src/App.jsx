import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import axios from 'axios';
import SeatLayout from './components/SeatLayout';
import { FaBus, FaRoute, FaSyncAlt, FaUsers, FaTimes, FaCog } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import './index.css';

// Lazy load modal components to reduce initial bundle size
const BookingForm = lazy(() => import('./components/BookingForm'));
const BookingDetails = lazy(() => import('./components/BookingDetails'));
const ConfirmDialog = lazy(() => import('./components/ConfirmDialog'));
const PassengerList = lazy(() => import('./components/PassengerList'));

function App() {
  // Helper to get local date string (YYYY-MM-DD)
  const getLocalDate = (offset = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]); // Array of {seat, gender}
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showPassengerList, setShowPassengerList] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState('Mannar to Colombo');
  const [selectedDate, setSelectedDate] = useState(getLocalDate(0)); // YYYY-MM-DD (Local)
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

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [newSeatCount, setNewSeatCount] = useState(51);

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

  // Initialize and fetch seats when date or route changes
  useEffect(() => {
    const initAndFetch = async () => {
      setLoading(true);
      try {
        // Initialize seats for the selected date
        await axios.post(`/api/seats/initialize?date=${selectedDate}`);
        setInitialized(true);

        // Then fetch the seats
        await fetchSeats();
      } catch (error) {
        console.error('Error initializing seats:', error);
        setLoading(false);
      }
    };

    initAndFetch();
  }, [selectedDate, selectedRoute, fetchSeats]);

  // Lock body scroll when passenger list modal is open
  useEffect(() => {
    // Lock scroll if any modal is open
    const anyModalOpen = showPassengerList || showBookingForm || showBookingDetails || showConfirmDialog || showStoragePrompt || showSettings;

    if (anyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPassengerList, showBookingForm, showBookingDetails, showConfirmDialog, showStoragePrompt, showSettings]);

  const handleSeatClick = useCallback((seat) => {
    if (seat.isBooked) {
      // If booked, show details view
      setSelectedSeats([{ seat, gender: seat.gender }]);
      setShowBookingDetails(true);
      return;
    }

    const isAlreadySelected = selectedSeats.some(({ seat: selectedSeat }) => selectedSeat._id === seat._id);

    if (isAlreadySelected) {
      // Deselect seat if clicked again
      setSelectedSeats(prev => prev.filter(({ seat: selectedSeat }) => selectedSeat._id !== seat._id));
      return;
    }

    // Add seat with default gender 'male' and show form
    setSelectedSeats(prev => {
      const newSelection = [...prev, { seat, gender: 'male' }];
      return newSelection;
    });
    // Always show the form when a seat is selected
    setShowBookingForm(true);
  }, [selectedSeats]);

  const handleEditBooking = useCallback((seat) => {
    // Show edit form for booking updates (from PassengerList)
    setSelectedSeats([{ seat, gender: seat.gender }]);
    setShowBookingForm(true);
  }, []);

  const handleUpdateGender = useCallback((seat, gender) => {
    setSelectedSeats(prev =>
      prev.map(item =>
        item.seat._id === seat._id ? { ...item, gender } : item
      )
    );
  }, []);

  const handleAddAnotherSeat = useCallback(() => {
    // Close the form to allow selecting another seat
    setShowBookingForm(false);
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

  const handleCancelBooking = useCallback(async (seatOrPassenger) => {
    // Check if it's a passenger object (with seats array) or a single seat
    const isPassengerGroup = seatOrPassenger.seats && Array.isArray(seatOrPassenger.seats);
    setSeatToCancel(seatOrPassenger);
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

  const handleUpdateSeatCount = async () => {
    if (!newSeatCount || newSeatCount < 5) return;

    setLoading(true);
    try {
      // Force re-initialization with new seat count
      await axios.post(`/api/seats/initialize?date=${selectedDate}&seatCount=${newSeatCount}&force=true`);
      await fetchSeats();
      setShowSettings(false);
    } catch (error) {
      console.error('Error updating layout:', error);
      alert('Error updating layout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      // Check if it's a passenger group or single seat
      const isPassengerGroup = seatToCancel.seats && Array.isArray(seatToCancel.seats);

      // Optimistically update UI immediately - remove booked status
      const seatIdsToCancel = isPassengerGroup
        ? seatToCancel.seats.map(s => s._id)
        : [seatToCancel._id];

      // Store previous state for rollback if needed
      const previousSeats = [...seats];

      // Immediately update the UI
      const updatedSeats = seats.map(seat => {
        if (seatIdsToCancel.includes(seat._id)) {
          return {
            ...seat,
            isBooked: false,
            passengerName: '',
            passengerPhone: '',
            boardingPoint: '',
            gender: '',
            isPickedUp: false,
            note: ''
          };
        }
        return seat;
      });

      setSeats(updatedSeats);

      // Also update localStorage cache immediately
      if (storageAllowed && typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(updatedSeats));
      }

      // Close dialog immediately for better UX
      setShowConfirmDialog(false);
      setSeatToCancel(null);
      setSelectedSeats([]); // Clear any selected seats immediately

      // Then make the actual API calls in the background
      if (isPassengerGroup) {
        // Cancel all seats in the group
        for (const seat of seatToCancel.seats) {
          await axios.delete(`/api/seats/${seat._id}/cancel`);
        }
      } else {
        // Cancel single seat
        await axios.delete(`/api/seats/${seatToCancel._id}/cancel`);
      }

      // Fetch fresh data from server to ensure consistency
      await fetchSeats();
      // Booking(s) cancelled successfully - no alert needed
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(error.response?.data?.message || 'Error cancelling booking');
      // Revert to previous state on error
      await fetchSeats();
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
        {/* Header */}
        <div className="glass-effect p-4 md:p-6 mb-6 md:mb-8 animate-fade-in">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 md:gap-6">
            {/* Title Section */}
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-blue-600/30 p-3 md:p-4 rounded-xl border border-blue-500/50 shrink-0">
                <FaBus className="text-2xl md:text-4xl text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-shadow bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  Bus Seat Reservation
                </h1>
                <p className="text-xs md:text-base text-white/70 mt-0.5 md:mt-1">Conductor Management System</p>
              </div>
            </div>

            {/* Controls Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 w-full xl:w-auto">

              {/* Route Selector */}
              <div className="relative w-full md:w-auto">
                <div className="flex items-center gap-2 bg-slate-800/50 p-1.5 rounded-xl border border-white/10 backdrop-blur-sm w-full md:w-auto">
                  <div className="flex items-center gap-2 text-blue-300 px-2 shrink-0">
                    <FaRoute className="text-lg" />
                    <span className="font-semibold text-xs md:text-sm hidden sm:inline">Route:</span>
                  </div>
                  <div className="relative flex bg-slate-900/50 rounded-lg p-1 flex-1 md:flex-none">
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
                                    transition-all duration-300 ease-out whitespace-nowrap flex-1 md:flex-none text-center
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
                          <span className="relative z-10 flex items-center justify-center gap-1">
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

              {/* Date & Refresh Controls */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {/* Quick Select Buttons */}
                <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/10 backdrop-blur-sm overflow-x-auto no-scrollbar">
                  {['Yesterday', 'Today', 'Tomorrow'].map((label, idx) => {
                    const offset = idx - 1; // -1, 0, 1
                    const dateStr = getLocalDate(offset);
                    const isActive = selectedDate === dateStr;

                    return (
                      <button
                        key={label}
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setSelectedSeats([]);
                          setShowBookingForm(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap
                                      ${isActive
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Date Picker */}
                <div className="flex items-center gap-2 bg-slate-800/50 p-2 md:p-2.5 rounded-xl border border-white/10 backdrop-blur-sm hover:border-white/20 transition-colors">
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
                           group ml-auto md:ml-0"
                  title="Refresh"
                >
                  <FaSyncAlt className="text-blue-300 group-hover:rotate-180 transition-transform duration-500" />
                </button>

                {/* Settings Button */}
                <button
                  onClick={() => {
                    setNewSeatCount(seats.length || 51);
                    setShowSettings(true);
                  }}
                  className="p-2 md:p-2.5 bg-slate-800/50 hover:bg-slate-700/50 
                           rounded-xl border border-white/10 transition-all duration-200 
                           hover:scale-105 active:scale-95 group"
                  title="Settings"
                >
                  <FaCog className="text-white/70 group-hover:text-white group-hover:rotate-90 transition-transform duration-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {/* Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 mt-4">
            <div className="glass-card p-2 md:p-3 text-center">
              <div className="text-xl md:text-2xl font-bold text-blue-400">{seats.length}</div>
              <div className="text-xs text-white/70 mt-0.5">Total Seats</div>
            </div>
            <div className="glass-card p-2 md:p-3 text-center">
              <div className="text-xl md:text-2xl font-bold text-green-400">{bookedCount}</div>
              <div className="text-xs text-white/70 mt-0.5">Booked</div>
            </div>
            <div className="glass-card p-2 md:p-3 text-center">
              <div className="text-xl md:text-2xl font-bold text-slate-400">{availableCount}</div>
              <div className="text-xs text-white/70 mt-0.5">Available</div>
            </div>
            <div className="glass-card p-2 md:p-3 text-center">
              <div className="text-xl md:text-2xl font-bold text-yellow-400">
                {seats.length > 0 ? Math.round((bookedCount / seats.length) * 100) : 0}%
              </div>
              <div className="text-xs text-white/70 mt-0.5">Occupancy</div>
            </div>
          </div>

          {/* Passenger List Button */}
          {bookedCount > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowPassengerList(true)}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3"
              >
                <FaUsers className="text-lg" />
                <span>View Passenger List ({bookedCount})</span>
              </button>
            </div>
          )}
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
          <div className="flex justify-center">
            {/* Seat Layout */}
            <div className="w-full max-w-3xl">
              {seats.length > 0 ? (
                <SeatLayout
                  seats={seats}
                  onSeatClick={handleSeatClick}
                  selectedSeats={selectedSeats}
                />
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
                      onUpdateGender={handleUpdateGender}
                      onAddAnotherSeat={handleAddAnotherSeat}
                    />
                  </Suspense>
                </div>
              )}

              {/* Booking Details View */}
              {showBookingDetails && selectedSeats.length > 0 && (
                <Suspense fallback={null}>
                  <BookingDetails
                    seat={seats.find(s => s._id === selectedSeats[0].seat._id) || selectedSeats[0].seat}
                    onClose={() => {
                      setSelectedSeats([]);
                      setShowBookingDetails(false);
                    }}
                    onTogglePickup={handleTogglePickup}
                    onCancel={(seat) => {
                      setShowBookingDetails(false);
                      handleCancelBooking(seat);
                    }}
                    onEdit={(seat) => {
                      setShowBookingDetails(false);
                      handleEditBooking(seat);
                    }}
                  />
                </Suspense>
              )}

            </div>
          </div>
        )}

        {/* Confirm Dialog */}
        {showConfirmDialog && seatToCancel && (
          <Suspense fallback={null}>
            <ConfirmDialog
              isOpen={showConfirmDialog}
              title="Cancel Booking"
              message={
                seatToCancel.seats && Array.isArray(seatToCancel.seats)
                  ? `Are you sure you want to cancel ${seatToCancel.seats.length} bookings for ${seatToCancel.passengerName || 'Guest'} (Seats: ${seatToCancel.seats.map(s => `#${s.seatNumber}`).join(', ')})?`
                  : `Are you sure you want to cancel the booking for ${seatToCancel.passengerName || 'Guest'} (Seat #${seatToCancel.seatNumber})?`
              }
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

        {/* Passenger List Modal */}
        {showPassengerList && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in overflow-hidden">
            <div className="glass-effect w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up">
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600/30 p-2 md:p-3 rounded-lg border border-blue-500/50">
                    <FaUsers className="text-xl md:text-2xl text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold">Passenger List</h2>
                    <p className="text-xs md:text-sm text-white/70 mt-0.5">
                      {bookedCount} {bookedCount === 1 ? 'passenger' : 'passengers'} booked
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPassengerList(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Close"
                >
                  <FaTimes className="text-xl text-white/70 hover:text-white" />
                </button>
              </div>

              {/* Passenger List Content */}
              <div className="flex-1 overflow-y-auto">
                <Suspense fallback={
                  <div className="p-6 space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="glass-card p-4 animate-pulse">
                        <div className="h-6 bg-white/10 rounded mb-2 w-1/2"></div>
                        <div className="h-4 bg-white/10 rounded w-1/3"></div>
                      </div>
                    ))}
                  </div>
                }>
                  <PassengerList seats={seats} />
                </Suspense>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="glass-effect p-5 w-full max-w-sm animate-slide-up">
              <h3 className="text-xl font-semibold mb-3">Seat Configuration</h3>
              <p className="text-white/80 text-sm mb-4">
                Set the total number of seats for this route. <br />
                <span className="text-blue-400 font-bold">Note: This will update the layout but preserve existing bookings where possible.</span>
              </p>

              <div className="mb-4">
                <label className="block text-xs text-white/60 mb-1">Total Seats</label>
                <input
                  type="number"
                  value={newSeatCount}
                  onChange={(e) => setNewSeatCount(parseInt(e.target.value))}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-2 text-white focus:border-blue-500 outline-none"
                  min="5"
                  max="100"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  className="btn-secondary"
                  onClick={() => setShowSettings(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary bg-blue-600 hover:bg-blue-700 border-blue-500"
                  onClick={handleUpdateSeatCount}
                >
                  Update Layout
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
