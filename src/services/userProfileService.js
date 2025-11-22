import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

// Get user profile (username, etc.)
export const getUserProfile = async (userId) => {
  if (!userId) {
    console.log('getUserProfile: No userId provided')
    return null
  }

  if (!db) {
    console.warn('getUserProfile: Firestore not initialized')
    return null
  }

  try {
    const profileRef = doc(db, 'userProfiles', userId)
    console.log('getUserProfile: Fetching profile for userId:', userId)
    const profileDoc = await getDoc(profileRef)
    
    if (profileDoc.exists()) {
      const profileData = profileDoc.data()
      console.log('getUserProfile: Profile found:', profileData)
      return profileData
    }
    
    console.log('getUserProfile: No profile found for userId:', userId)
    return null
  } catch (error) {
    console.error('getUserProfile: Error fetching user profile:', error)
    // Return null instead of throwing to allow app to continue
    return null
  }
}

// Create or update user profile
export const setUserProfile = async (userId, profileData) => {
  if (!userId || !db) {
    console.error('setUserProfile: Missing userId or db')
    return false
  }

  try {
    const profileRef = doc(db, 'userProfiles', userId)
    const dataToSave = {
      ...profileData,
      updatedAt: new Date().toISOString()
    }
    console.log('setUserProfile: Saving to Firestore:', { userId, data: dataToSave })
    await setDoc(profileRef, dataToSave, { merge: true })
    console.log('setUserProfile: Successfully saved profile')
    return true
  } catch (error) {
    console.error('setUserProfile: Error saving user profile:', error)
    return false
  }
}

// Set username for a user
export const setUsername = async (userId, username, userEmail, updateTransactions = false) => {
  if (!userId || !username) {
    return false
  }

  // Validate username
  if (username.length < 3) {
    throw new Error('Username must be at least 3 characters long')
  }
  if (username.length > 20) {
    throw new Error('Username must be less than 20 characters')
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new Error('Username can only contain letters, numbers, and underscores')
  }

  try {
    // Get existing profile to preserve createdAt
    const existingProfile = await getUserProfile(userId)
    
    const profileData = {
      username: username.trim(),
      email: userEmail,
      createdAt: existingProfile?.createdAt || new Date().toISOString() // Preserve original creation date
    }
    
    console.log('setUsername: Saving profile data:', profileData)
    const saved = await setUserProfile(userId, profileData)
    
    if (!saved) {
      throw new Error('Failed to save username to Firestore')
    }
    
    // Verify it was saved
    const verifyProfile = await getUserProfile(userId)
    console.log('setUsername: Verified saved profile:', verifyProfile)
    
    if (!verifyProfile?.username) {
      throw new Error('Username was not saved correctly')
    }
    
    // If updating username, update all transactions
    if (updateTransactions && existingProfile?.username) {
      await updateTransactionsUsername(userId, existingProfile.username, username.trim())
    }
    
    return true
  } catch (error) {
    console.error('Error setting username:', error)
    throw error
  }
}

// Update all transactions with new username
const updateTransactionsUsername = async (userId, oldUsername, newUsername) => {
  if (!userId || !db) {
    return false
  }

  try {
    const transactionsRef = collection(db, `users/${userId}/transactions`)
    const q = query(transactionsRef, where('createdBy', '==', oldUsername))
    const querySnapshot = await getDocs(q)
    
    const updatePromises = []
    querySnapshot.forEach((docSnapshot) => {
      const transactionRef = doc(db, `users/${userId}/transactions`, docSnapshot.id)
      updatePromises.push(updateDoc(transactionRef, { createdBy: newUsername }))
    })
    
    await Promise.all(updatePromises)
    console.log(`Updated ${updatePromises.length} transactions with new username`)
    return true
  } catch (error) {
    console.error('Error updating transactions username:', error)
    throw error
  }
}

// Get username for a user (with fallback to email)
export const getDisplayName = async (userId, userEmail) => {
  const profile = await getUserProfile(userId)
  return profile?.username || userEmail || 'Unknown'
}

