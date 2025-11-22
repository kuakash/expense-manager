import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore'
import { db } from '../config/firebase'

const COLLECTION_NAME = 'transactions'

// Get user-specific collection path
const getUserCollectionPath = (userId) => {
  if (!userId) return null
  return `users/${userId}/${COLLECTION_NAME}`
}

// Check if Firestore is available
const isFirestoreAvailable = () => {
  return db !== null
}

// Get all transactions from Firestore
export const getTransactionsFromFirestore = async (userId) => {
  if (!isFirestoreAvailable() || !userId) {
    return null
  }

  try {
    const userCollectionPath = getUserCollectionPath(userId)
    if (!userCollectionPath) return null

    const transactionsRef = collection(db, userCollectionPath)
    const q = query(transactionsRef, orderBy('date', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const transactions = []
    querySnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return transactions
  } catch (error) {
    console.error('Error fetching transactions from Firestore:', error)
    return null
  }
}

// Save a single transaction to Firestore
export const saveTransactionToFirestore = async (transaction, userId) => {
  if (!isFirestoreAvailable() || !userId) {
    return false
  }

  try {
    const userCollectionPath = getUserCollectionPath(userId)
    if (!userCollectionPath) return false

    const transactionRef = doc(db, userCollectionPath, String(transaction.id))
    
    // Get existing transaction to preserve createdAt if it exists
    const existingDoc = await getDoc(transactionRef)
    const existingData = existingDoc.exists() ? existingDoc.data() : {}
    
    await setDoc(transactionRef, {
      ...transaction,
      id: String(transaction.id), // Ensure ID is stored as string
      createdAt: transaction.createdAt || existingData.createdAt || new Date().toISOString(),
      createdBy: transaction.createdBy || existingData.createdBy || 'Unknown',
      updatedAt: new Date().toISOString(),
      // Preserve edit tracking if it exists, or use new values
      editedBy: transaction.editedBy || existingData.editedBy || null,
      editedAt: transaction.editedAt || existingData.editedAt || null,
      // Preserve edit history
      editHistory: transaction.editHistory || existingData.editHistory || []
    }, { merge: true })
    return true
  } catch (error) {
    console.error('Error saving transaction to Firestore:', error)
    return false
  }
}


// Delete a transaction from Firestore
export const deleteTransactionFromFirestore = async (transactionId, userId) => {
  if (!isFirestoreAvailable() || !userId) {
    return false
  }

  try {
    const userCollectionPath = getUserCollectionPath(userId)
    if (!userCollectionPath) return false

    const transactionRef = doc(db, userCollectionPath, String(transactionId))
    await deleteDoc(transactionRef)
    return true
  } catch (error) {
    console.error('Error deleting transaction from Firestore:', error)
    return false
  }
}

// Subscribe to real-time updates from Firestore
export const subscribeToTransactions = (callback, userId) => {
  if (!isFirestoreAvailable() || !userId) {
    return () => {} // Return empty unsubscribe function
  }

  try {
    const userCollectionPath = getUserCollectionPath(userId)
    if (!userCollectionPath) return () => {}

    const transactionsRef = collection(db, userCollectionPath)
    const q = query(transactionsRef, orderBy('date', 'desc'))
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const transactions = []
      querySnapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data()
        })
      })
      callback(transactions)
    }, (error) => {
      console.error('Error in Firestore subscription:', error)
    })

    return unsubscribe
  } catch (error) {
    console.error('Error setting up Firestore subscription:', error)
    return () => {} // Return empty unsubscribe function
  }
}


