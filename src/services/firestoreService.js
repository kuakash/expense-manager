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

// Check if Firestore is available
const isFirestoreAvailable = () => {
  return db !== null
}

// Get all transactions from Firestore
export const getTransactionsFromFirestore = async () => {
  if (!isFirestoreAvailable()) {
    return null
  }

  try {
    const transactionsRef = collection(db, COLLECTION_NAME)
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
export const saveTransactionToFirestore = async (transaction) => {
  if (!isFirestoreAvailable()) {
    return false
  }

  try {
    const transactionRef = doc(db, COLLECTION_NAME, String(transaction.id))
    await setDoc(transactionRef, {
      ...transaction,
      id: String(transaction.id), // Ensure ID is stored as string
      updatedAt: new Date().toISOString()
    }, { merge: true })
    return true
  } catch (error) {
    console.error('Error saving transaction to Firestore:', error)
    return false
  }
}

// Save all transactions to Firestore
export const saveAllTransactionsToFirestore = async (transactions) => {
  if (!isFirestoreAvailable()) {
    return false
  }

  try {
    // Save all transactions in batch
    const promises = transactions.map(transaction => 
      saveTransactionToFirestore(transaction)
    )
    await Promise.all(promises)
    return true
  } catch (error) {
    console.error('Error saving all transactions to Firestore:', error)
    return false
  }
}

// Delete a transaction from Firestore
export const deleteTransactionFromFirestore = async (transactionId) => {
  if (!isFirestoreAvailable()) {
    return false
  }

  try {
    const transactionRef = doc(db, COLLECTION_NAME, String(transactionId))
    await deleteDoc(transactionRef)
    return true
  } catch (error) {
    console.error('Error deleting transaction from Firestore:', error)
    return false
  }
}

// Subscribe to real-time updates from Firestore
export const subscribeToTransactions = (callback) => {
  if (!isFirestoreAvailable()) {
    return () => {} // Return empty unsubscribe function
  }

  try {
    const transactionsRef = collection(db, COLLECTION_NAME)
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

// Sync localStorage data to Firestore (one-time migration)
export const syncLocalStorageToFirestore = async () => {
  if (!isFirestoreAvailable()) {
    return false
  }

  try {
    const localData = localStorage.getItem('transactions')
    if (!localData) {
      return false
    }

    const transactions = JSON.parse(localData)
    if (transactions.length === 0) {
      return false
    }

    // Check if Firestore already has data
    const firestoreData = await getTransactionsFromFirestore()
    if (firestoreData && firestoreData.length > 0) {
      // Firestore has data, don't overwrite
      return false
    }

    // Migrate local data to Firestore
    await saveAllTransactionsToFirestore(transactions)
    return true
  } catch (error) {
    console.error('Error syncing localStorage to Firestore:', error)
    return false
  }
}

