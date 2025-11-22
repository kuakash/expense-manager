import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth'
import { auth } from '../config/firebase'

// Send password reset email
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email)
    return { success: true, error: null }
  } catch (error) {
    console.error('Password reset error:', error)
    let errorMessage = 'An error occurred while sending the password reset email.'
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email address.'
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.'
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection.'
    } else if (error.message) {
      errorMessage = `Password reset failed: ${error.message}`
    }
    
    return { success: false, error: errorMessage }
  }
}

// Sign in an existing user
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { user: userCredential.user, error: null }
  } catch (error) {
    console.error('Sign in error:', error)
    let errorMessage = 'An error occurred during sign in.'
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email address.'
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password.'
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.'
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'This account has been disabled.'
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Email/Password authentication is not enabled. Please contact the administrator.'
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection.'
    } else if (error.message) {
      errorMessage = `Sign in failed: ${error.message}`
    }
    
    return { user: null, error: errorMessage }
  }
}

// Sign out the current user
export const logOut = async () => {
  try {
    await signOut(auth)
    return { error: null }
  } catch (error) {
    return { error: 'An error occurred during sign out.' }
  }
}

// Get the current user
export const getCurrentUser = () => {
  return auth.currentUser
}

// Subscribe to auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}

