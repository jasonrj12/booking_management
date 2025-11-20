# Bus Seat Reservation System - MERN Stack

A full-stack web application for bus conductors to manage seat reservations with passenger information for routes between Mannar and Colombo.

## 🚀 Features

- **Dual Route Management**: Separate seat management for Mannar to Colombo and Colombo to Mannar routes
- **Interactive Seat Layout**: Visual 40-seat bus layout with real-time availability
- **Passenger Management**: Add, edit, and remove passenger bookings
- **Responsive Design**: Modern glassmorphism UI with Tailwind CSS
- **Real-time Updates**: Instant seat status updates across the application
- **Statistics Dashboard**: View occupancy rates and seat availability at a glance

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **Firebase Firestore** (Cloud NoSQL database)
- **Firebase Admin SDK** for server-side operations
- **CORS** for cross-origin requests
- **dotenv** for environment configuration

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Icons** for UI icons

## 📋 Prerequisites

- Node.js (v16 or higher)
- Firebase account (free tier available)
- npm or yarn package manager

## ⚙️ Installation

### 1. Clone the repository
```bash
cd "Reservation _app"
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install
```

### 3. Firebase Configuration

**Follow the detailed guide in [FIREBASE_SETUP.md](FIREBASE_SETUP.md)**

Quick summary:
1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firestore Database
3. Generate service account key (JSON file)
4. Create `.env` file in the `server` folder with your Firebase credentials:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
PORT=5000
```

See `.env.example` for template format.

### 4. Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install
```

## 🚀 Running the Application

### Start Backend Server

```bash
# From the server directory
cd server
npm start
```

The backend server will start on **http://localhost:5000**

You should see:
```
✅ Firebase initialized successfully
🚀 Server running on http://localhost:5000
💾 Using Firebase Firestore as database
```

### Start Frontend Development Server

```bash
# From the client directory (in a new terminal)
cd client
npm run dev
```

The frontend will start on **http://localhost:5173**

### Open the Application

Visit **http://localhost:5173** in your browser

## 📡 API Endpoints

### Base URL: `http://localhost:5000/api/seats`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/initialize` | Initialize 40 seats for both routes |
| GET | `/?route=<route_name>` | Get all seats for specified route |
| POST | `/:id/book` | Book a seat with passenger details |
| PUT | `/:id/update` | Update passenger information |
| DELETE | `/:id/cancel` | Cancel a booking |

### Example Requests

**Get seats for a route:**
```bash
GET /api/seats?route=Mannar to Colombo
```

**Book a seat:**
```bash
POST /api/seats/:seatId/book
Content-Type: application/json

{
  "passengerName": "John Doe",
  "passengerPhone": "0771234567"
}
```

## 🎨 Application Features

### Route Selection
- Switch between "Mannar to Colombo" and "Colombo to Mannar" routes
- Each route maintains separate seat availability

### Seat Booking
1. Select a route from the dropdown
2. Click on an available (gray) seat
3. Fill in passenger name and 10-digit phone number
4. Click "Confirm Booking"

### Edit Booking
1. Click on a booked (green) seat OR
2. Click the edit icon in the passenger list
3. Modify passenger information
4. Click "Update Booking"

### Cancel Booking
1. Click the trash icon in the passenger list
2. Confirm the cancellation

## 🏗️ Project Structure

```
Reservation _app/
├── server/
│   ├── config/
│   │   └── firebase.js
│   ├── routes/
│   │   └── seatRoutes.js
│   ├── server.js
│   ├── .env (create this)
│   ├── .env.example
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SeatCard.jsx
│   │   │   ├── SeatLayout.jsx
│   │   │   ├── BookingForm.jsx
│   │   │   └── PassengerList.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── FIREBASE_SETUP.md
└── README.md
```

## 🎯 Usage Tips

- **Seat Colors**: 
  - Gray = Available
  - Green = Booked
- **Position Indicators**:
  - Blue dot = Window seat
  - Yellow dot = Aisle seat
- **Statistics**: View real-time occupancy percentage and seat counts in the header
- **Refresh Button**: Manually refresh seat data if needed

## 🔧 Troubleshooting

**Backend won't start:**
- Ensure Firebase credentials in `.env` are correct
- Check if port 5000 is available
- Verify private key format (including \n characters)

**Frontend shows connection errors:**
- Ensure backend server is running on port 5000
- Check browser console for specific errors
- Verify Vite proxy configuration

**Firebase connection issues:**
- Check that Firestore is enabled in Firebase Console
- Verify service account has proper permissions
- Review Firestore security rules

## 📝 License

ISC

## 👨‍💻 Development

Built with ❤️ using the MERN stack for efficient bus seat reservation management.
