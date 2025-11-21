# Firebase Setup Guide

This app uses Firebase Firestore for cloud storage. Follow these steps to set up Firebase:

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter a project name (e.g., "expense-tracker")
   - Enable Google Analytics (optional)
   - Click "Create project"

## Step 2: Enable Firestore Database

1. In your Firebase project, go to **Build** → **Firestore Database**
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location closest to you
5. Click "Enable"

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "Expense Tracker Web")
5. Copy the Firebase configuration object

## Step 4: Set Up Environment Variables

1. Create a `.env` file in the root of your project (if it doesn't exist)
2. Add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Replace the values with your actual Firebase configuration values.

## Step 5: Set Up Firestore Security Rules (Important!)

1. Go to **Firestore Database** → **Rules** tab
2. Update the rules to allow read/write access (for development):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ Important:** The above rules allow anyone to read/write. For production, you should add authentication and proper security rules.

## Step 6: Create Firestore Index (Optional but Recommended)

1. Go to **Firestore Database** → **Indexes** tab
2. Click "Create Index"
3. Collection ID: `transactions`
4. Fields to index:
   - Field: `date`, Order: Descending
5. Click "Create"

## Step 7: Test Your Setup

1. Start your development server: `npm run dev`
2. The app will automatically:
   - Try to connect to Firestore
   - Sync existing localStorage data to Firestore (one-time migration)
   - Load data from Firestore if available
   - Fall back to localStorage if Firestore is not configured

## Troubleshooting

### App shows "Syncing..." but doesn't stop
- Check your Firebase configuration in `.env`
- Verify Firestore is enabled in Firebase Console
- Check browser console for errors

### Data not syncing
- Ensure all environment variables are set correctly
- Check Firestore security rules allow read/write
- Verify your internet connection

### App works but data doesn't persist across devices
- Make sure you've deployed with the `.env` variables set in your hosting platform
- For Netlify: Add environment variables in Site settings → Environment variables
- For Vercel: Add environment variables in Project settings → Environment Variables

## Firebase Free Tier Limits

The Firebase free tier (Spark plan) includes:
- **50,000 reads/day**
- **20,000 writes/day**
- **1 GB storage**
- **10 GB/month network egress**

This is more than enough for personal expense tracking!

## Production Security Rules

For production, update your Firestore rules to require authentication:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Then implement Firebase Authentication in your app.

