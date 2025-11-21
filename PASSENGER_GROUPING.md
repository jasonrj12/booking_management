# Passenger Grouping Feature

## Summary
Implemented passenger grouping in the passenger list so that when a passenger books multiple seats (same phone number), they appear as one consolidated entry instead of multiple separate entries.

## Changes Made

### **Before:**
If a passenger booked seats #12 and #15, they would appear as:
```
┌─────────────────────┐
│ #12  John Doe       │
│ 0771234567          │
└─────────────────────┘

┌─────────────────────┐
│ #15  John Doe       │
│ 0771234567          │
└─────────────────────┘
```

### **After:**
Now they appear as one grouped entry:
```
┌─────────────────────┐
│ #12 #15  John Doe   │
│ [2 seats]           │
│ 0771234567          │
└─────────────────────┘
```

## Implementation Details

### **1. PassengerCard Component**
- **Changed prop:** From `seat` to `passenger` object
- **Passenger object structure:**
  ```javascript
  {
    passengerName: string,
    passengerPhone: string,
    boardingPoint: string,
    seats: [seat1, seat2, ...],
    isPickedUp: boolean
  }
  ```
- **Multiple seat numbers:** Displays all seat numbers in a row (e.g., #12 #15 #23)
- **Seat count badge:** Shows "X seats" badge when passenger has multiple seats
- **Row info:** Shows "X seats booked" instead of individual row/position for multi-seat bookings
- **Actions:** All buttons (edit, cancel, pickup) use the first seat for operations

### **2. PassengerList Component**
- **Added grouping logic:** Uses `useMemo` to group seats by phone number
- **Grouping algorithm:**
  1. Filter booked seats
  2. Create groups object with phone number as key
  3. For each seat, add to corresponding group
  4. Return array of grouped passenger objects
- **Optimized rendering:** Memoized grouping prevents unnecessary recalculations

### **3. Visual Enhancements**
- **Multiple seat badges:** Displayed horizontally with small gap
- **Seat count indicator:** Blue badge showing "X seats" for multi-seat bookings
- **Responsive layout:** Flex-wrap ensures seat numbers wrap on smaller screens
- **Consistent styling:** Maintains same visual hierarchy as single-seat bookings

## Files Modified

1. **`PassengerList.jsx`**
   - Added `useMemo` import
   - Updated `PassengerCard` to accept `passenger` prop
   - Added passenger grouping logic
   - Updated rendering to use grouped passengers
   - Modified memo comparison to handle passenger objects

## Benefits

✅ **Cleaner UI** - Less clutter in passenger list
✅ **Better Organization** - Easy to see multi-seat bookings at a glance
✅ **Reduced Scrolling** - Fewer entries to scroll through
✅ **Clear Visual Feedback** - Seat count badge makes multi-seat bookings obvious
✅ **Maintained Functionality** - All actions (edit, cancel, pickup) still work correctly
✅ **Performance** - Memoized grouping for optimal rendering

## Edge Cases Handled

- ✅ Single seat bookings still display normally
- ✅ Multiple seats sorted numerically (#12, #15, #23)
- ✅ Actions apply to first seat in group
- ✅ Pickup status uses first seat's status
- ✅ Empty passenger list handled correctly

## Future Enhancements (Optional)

- Allow toggling pickup status for individual seats in a group
- Show individual seat details on hover/expand
- Bulk actions for all seats in a group
- Visual indicator for seats with different genders in same booking
