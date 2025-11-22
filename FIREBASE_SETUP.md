# Firebase Setup Guide

This app uses Firebase Firestore for cloud storage. Follow these steps to set up Firebase:

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter a project name (e.g., "expense-tracker")
   - Enable Google Analytics (optional)
   - Click "Create project"

## Step 2: Enable Firebase Authentication

1. In your Firebase project, go to **Build** → **Authentication**
2. Click "Get started"
3. Click on the **Sign-in method** tab
4. Click on **Email/Password**
5. Enable the first toggle (Email/Password)
6. Click "Save"

### Adding Users from Firebase Console

Since sign-up is disabled in the app, you need to add users manually from Firebase Console:

1. Go to **Authentication** → **Users** tab
2. Click **Add user** button
3. Enter the user's **Email** and **Password**
4. Click **Add user**
5. The user will receive an email (if email verification is enabled) and can sign in immediately

**Note:** Users can reset their password using the "Forgot Password?" link on the sign-in page.

## Step 3: Enable Firestore Database

1. In your Firebase project, go to **Build** → **Firestore Database**
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location closest to you
5. Click "Enable"

## Step 4: Get Your Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "Expense Tracker Web")
5. Copy the Firebase configuration object

## Step 5: Set Up Environment Variables

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

## Step 6: Set Up Firestore Security Rules (Important!)

1. Go to **Firestore Database** → **Rules** tab
2. Update the rules to require authentication and ensure users can only access their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own transactions
    match /users/{userId}/transactions/{transactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own profile
    match /userProfiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**⚠️ Important:** These rules ensure that:
- Users must be authenticated to access data
- Users can only access their own transactions (based on their user ID)
- Users can only access their own profile (username)
- Data is stored in user-specific collections: `users/{userId}/transactions`
- User profiles are stored in: `userProfiles/{userId}`

## Step 7: Create Firestore Index (Optional but Recommended)

1. Go to **Firestore Database** → **Indexes** tab
2. Click "Create Index"
3. Collection ID: `transactions` (under `users/{userId}/transactions`)
4. Fields to index:
   - Field: `date`, Order: Descending
5. Click "Create"

**Note:** The collection path is `users/{userId}/transactions`, but you'll see it as just `transactions` in the index creation UI.

## Step 8: Test Your Setup

1. Start your development server: `npm run dev`
2. You should see the authentication screen first
3. Sign up with an email from your whitelist (or sign in if you already have an account)
4. The app will automatically:
   - Authenticate the user
   - Try to connect to Firestore
   - Sync existing localStorage data to Firestore (one-time migration, user-specific)
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
- **50,000 reads/day** (Firestore)
- **20,000 writes/day** (Firestore)
- **1 GB storage** (Firestore)
- **10 GB/month network egress** (Firestore)
- **Unlimited authentication requests**
- **50,000 monthly active users (MAU)** (Authentication)

This is more than enough for personal expense tracking and small team use!

## Authentication Features

The app now includes:
- ✅ Email/Password authentication (sign-in only)
- ✅ Password reset functionality
- ✅ User-specific data storage (each user's transactions are isolated)
- ✅ Automatic sign-in persistence
- ✅ Sign out functionality

## User Management

**Adding New Users:**
- Users must be added from Firebase Console (see Step 2 above)
- No sign-up functionality in the app
- Admin controls all user creation

**Username System:**
- Users are prompted to set a username on first login
- Username is used to track who created each transaction
- Username must be 3-20 characters, letters, numbers, and underscores only
- Username is stored in `userProfiles` collection in Firestore

**Password Reset:**
- Users can reset their password using the "Forgot Password?" link on the sign-in page
- They will receive an email with reset instructions
- No admin intervention needed for password resets

