# Firebase Setup Guide for Bus Reservation Application

## Step 1: Create Firebase Project

1. **Go to Firebase Console:**
   - Visit https://console.firebase.google.com/
   - Click "Add project" or "Create a project"

2. **Create New Project:**
   - Enter project name: `bus-reservation` (or your preferred name)
   - Accept terms and click "Continue"
   - Disable Google Analytics (optional) or configure it
   - Click "Create project"
   - Wait for project creation (~30 seconds)
   - Click "Continue"

## Step 2: Enable Firestore Database

1. **Navigate to Firestore:**
   - In the left sidebar, click "Build" → "Firestore Database"
   - Click "Create database"

2. **Configure Database:**
   - Select "Start in **production mode**" (we'll add rules later)
   - Click "Next"
   - Choose a Cloud Firestore location close to you (e.g., `asia-south1` for India)
   - Click "Enable"

3. **Set Up Security Rules:**
   - Go to the "Rules" tab
   - Replace the rules with:
   
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   
   - Click "Publish"
   
   > **Note:** These permissive rules are for development. In production, you should add proper authentication.

## Step 3: Generate Service Account Key

1. **Go to Project Settings:**
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"

2. **Navigate to Service Accounts:**
   - Click the "Service accounts" tab at the top
   - You should see "Firebase Admin SDK"

3. **Generate Private Key:**
   - Click "Generate new private key" button
   - A dialog will appear - click "Generate key"
   - A JSON file will be downloaded to your computer
   - **Keep this file secure!** It contains sensitive credentials

## Step 4: Configure Environment Variables

1. **Open the downloaded JSON file** in a text editor

2. **Create `.env` file in the `server` folder** with these values:

```env
FIREBASE_PROJECT_ID=your-project-id-from-json
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-actual-private-key-from-json\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
PORT=5000
```

3. **Copy values from JSON file:**
   - `FIREBASE_PROJECT_ID` → Copy the value of `project_id`
   - `FIREBASE_PRIVATE_KEY` → Copy the **entire** value of `private_key` (including the quotes and \n characters)
   - `FIREBASE_CLIENT_EMAIL` → Copy the value of `client_email`

**Example mapping from downloaded JSON:**
```json
{
  "type": "service_account",
  "project_id": "bus-reservation-12345",  ← Use this for FIREBASE_PROJECT_ID
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n",  ← Use this for FIREBASE_PRIVATE_KEY
  "client_email": "firebase-adminsdk-abc@bus-reservation-12345.iam.gserviceaccount.com",  ← Use this for FIREBASE_CLIENT_EMAIL
  ...
}
```

## Step 5: Create the .env File

1. **Navigate to server folder:**
   ```bash
   cd server
   ```

2. **Create .env file** (if it doesn't exist):
   ```bash
   New-Item .env -ItemType File
   ```

3. **Edit the .env file** in VS Code or Notepad and paste your configuration

**Important Notes:**
- Make sure the `FIREBASE_PRIVATE_KEY` is wrapped in double quotes
- Keep all the `\n` characters in the private key - they're important!
- Never commit the `.env` file to Git (it's already in `.gitignore`)

## Step 6: Start the Backend Server

1. **Open terminal in server folder:**
   ```bash
   cd server
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **You should see:**
   ```
   ✅ Firebase initialized successfully
   🚀 Server running on http://localhost:5000
   💾 Using Firebase Firestore as database
   ```

## Step 7: Test the Application

1. **Ensure frontend is running** (in another terminal):
   ```bash
   cd client
   npm run dev
   ```

2. **Open browser:**
   - Go to http://localhost:5173
   - Select a route (Mannar to Colombo or Colombo to Mannar)
   - The app will automatically initialize 40 seats for each route on first load

3. **Test booking:**
   - Click on an available (gray) seat
   - Enter passenger name and phone number
   - Click "Confirm Booking"
   - Seat should turn green

## Firestore Data Structure

Your Firestore database will have a collection called `seats` with documents like:

```json
{
  "seatNumber": 1,
  "route": "Mannar to Colombo",
  "isBooked": true,
  "passengerName": "John Doe",
  "passengerPhone": "0771234567",
  "rowNumber": 1,
  "position": "Window",
  "createdAt": "2025-11-20T00:00:00.000Z",
  "updatedAt": "2025-11-20T00:05:00.000Z"
}
```

## Viewing Your Data in Firebase Console

1. Go to https://console.firebase.google.com/
2. Select your project
3. Click "Firestore Database" in the left sidebar
4. You'll see the `seats` collection with all documents
5. Each document represents one seat

## Troubleshooting

### Error: "Firebase initialization error"
- Check that all environment variables in `.env` are set correctly
- Verify the private key has proper quotes and `\n` characters
- Make sure there are no extra spaces in the `.env` file

### Error: "Permission denied"
- Go to Firestore → Rules and verify they allow read/write access
- Check that your service account has proper permissions

### Error: "Collection not found"
- The collection is created automatically when you first book a seat
- Check Firebase Console → Firestore Database to verify

### Seats not initializing
- Check browser console for errors
- Verify backend server is running without errors
- Check that the `/api/seats/initialize` endpoint is being called

## Security Recommendations for Production

When deploying to production, update Firestore security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /seats/{seatId} {
      allow read: if true;
      allow write: if request.auth != null; // Require authentication
    }
  }
}
```

Then implement Firebase Authentication in your frontend for conductor login.

## Additional Resources

- Firebase Documentation: https://firebase.google.com/docs/firestore
- Firestore Security Rules: https://firebase.google.com/docs/firestore/security/get-started
- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup

---

**That's it!** Your bus reservation application is now using Firebase Firestore as the database. No local database installation needed! 🎉
