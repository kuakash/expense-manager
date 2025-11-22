// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrsYWcZD6NgKr5U79obneYCGVs9SSYGYY",
  authDomain: "homespendr.firebaseapp.com",
  projectId: "homespendr",
  storageBucket: "homespendr.firebasestorage.app",
  messagingSenderId: "521396468806",
  appId: "1:521396468806:web:8efe100f39c0bf76b2de47"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

export { db, auth }
export default app

