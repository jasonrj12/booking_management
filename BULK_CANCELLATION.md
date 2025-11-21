# Bulk Cancellation Feature

## Summary
Implemented bulk cancellation functionality so that when a passenger with multiple seats (grouped booking) is canceled, all their seats are canceled at once instead of requiring individual cancellations.

## Problem
Previously, when a passenger booked multiple seats (e.g., seats #12 and #15), they appeared as one grouped entry in the passenger list. However, clicking the cancel button would only cancel the first seat, leaving the other seats still booked.

## Solution
Updated the cancellation flow to detect when canceling a grouped passenger and automatically cancel all seats associated with that passenger's phone number.

## Changes Made

### **1. PassengerList.jsx**
- **Updated cancel button:**
  - Now passes the entire `passenger` object instead of just `firstSeat`
  - Dynamic tooltip shows "Cancel X bookings" for multi-seat groups
  
```javascript
// Before
onClick={() => onCancel(firstSeat)}
title="Cancel booking"

// After
onClick={() => onCancel(passenger)}
title={passenger.seats.length > 1 ? `Cancel ${passenger.seats.length} bookings` : 'Cancel booking'}
```

### **2. App.jsx - handleCancelBooking**
- **Updated to accept both seat and passenger objects:**
  - Detects if the parameter is a passenger group or single seat
  - Sets the appropriate data for the confirm dialog

```javascript
const handleCancelBooking = useCallback(async (seatOrPassenger) => {
  const isPassengerGroup = seatOrPassenger.seats && Array.isArray(seatOrPassenger.seats);
  setSeatToCancel(seatOrPassenger);
  setShowConfirmDialog(true);
}, []);
```

### **3. App.jsx - confirmCancelBooking**
- **Added bulk cancellation logic:**
  - Checks if canceling a passenger group or single seat
  - Iterates through all seats in a group and cancels each one
  - Shows appropriate success message

```javascript
const confirmCancelBooking = async () => {
  const isPassengerGroup = seatToCancel.seats && Array.isArray(seatToCancel.seats);
  
  if (isPassengerGroup) {
    // Cancel all seats in the group
    for (const seat of seatToCancel.seats) {
      await axios.delete(`/api/seats/${seat._id}/cancel`);
    }
  } else {
    // Cancel single seat
    await axios.delete(`/api/seats/${seatToCancel._id}/cancel`);
  }
  
  await fetchSeats();
  // ... cleanup
};
```

### **4. App.jsx - Confirm Dialog Message**
- **Dynamic message based on booking type:**
  - Single seat: "Are you sure you want to cancel the booking for John (Seat #12)?"
  - Multiple seats: "Are you sure you want to cancel 2 bookings for John (Seats: #12, #15)?"

```javascript
message={
  seatToCancel.seats && Array.isArray(seatToCancel.seats)
    ? `Are you sure you want to cancel ${seatToCancel.seats.length} bookings for ${seatToCancel.passengerName || 'Guest'} (Seats: ${seatToCancel.seats.map(s => `#${s.seatNumber}`).join(', ')})?`
    : `Are you sure you want to cancel the booking for ${seatToCancel.passengerName || 'Guest'} (Seat #${seatToCancel.seatNumber})?`
}
```

## User Experience

### **Before:**
1. Passenger books seats #12 and #15
2. They appear as one grouped entry
3. Click cancel → Only seat #12 is canceled
4. Seat #15 remains booked
5. Need to manually find and cancel seat #15

### **After:**
1. Passenger books seats #12 and #15
2. They appear as one grouped entry
3. Click cancel → Confirm dialog shows "Cancel 2 bookings for John (Seats: #12, #15)?"
4. Click "Yes, Cancel" → **Both seats canceled at once** ✅
5. Passenger entry disappears from list

## Benefits

✅ **Consistent UX** - Grouping and cancellation work together logically
✅ **Time Saving** - No need to cancel each seat individually
✅ **Prevents Errors** - Can't accidentally leave seats booked
✅ **Clear Feedback** - Dialog shows exactly what will be canceled
✅ **Flexible** - Still works for single-seat bookings

## Technical Details

- **Backward Compatible:** Works with both old single-seat flow and new grouped flow
- **Error Handling:** If one seat fails to cancel, the error is caught and displayed
- **Performance:** Sequential cancellation ensures data consistency
- **Type Safety:** Checks for `seats` array to determine object type

## Files Modified

1. ✅ `PassengerList.jsx` - Updated cancel button handler and tooltip
2. ✅ `App.jsx` - Updated handleCancelBooking, confirmCancelBooking, and dialog message

## Testing Checklist

- ✅ Cancel single-seat booking
- ✅ Cancel multi-seat booking (2+ seats)
- ✅ Confirm dialog shows correct message
- ✅ All seats removed from database
- ✅ Passenger entry disappears from list
- ✅ Seat layout updates correctly
- ✅ Error handling works if cancellation fails
