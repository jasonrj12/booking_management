# UI Fix - Floating Panel Issue

## Problem
When selecting a 2nd seat after clicking "Add Another Seat", the floating "Continue to Booking Form" button was appearing at the bottom, even though the booking form should automatically open.

## Root Cause
The `handleSeatClick` function was only showing the booking form when the **first** seat was selected (`if (prev.length === 0)`). When adding a 2nd seat, the form wouldn't open, causing the floating selection panel to appear instead.

## Solution
1. **Auto-open form for ALL seat selections** - Changed `handleSeatClick` to always call `setShowBookingForm(true)` whenever a seat is selected, not just the first one.

2. **Removed floating selection panel** - Since the form now always opens when selecting seats, the floating panel is no longer needed and was removed entirely.

## New Flow
1. Click first seat → Form opens with seat #1
2. Click "Add Another Seat" → Form closes
3. Click second seat → **Form immediately reopens** with both seats
4. Set genders, fill details → Submit

## Changes Made
- **File:** `App.jsx`
- **Line 124:** Moved `setShowBookingForm(true)` outside the conditional to always execute
- **Lines 557-603:** Removed entire floating selection panel section

## Result
✅ No more floating button appearing when adding seats
✅ Seamless multi-seat booking experience
✅ Form always visible when seats are selected
✅ Cleaner, more predictable UX
