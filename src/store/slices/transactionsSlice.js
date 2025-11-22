import { createSlice } from '@reduxjs/toolkit'
import { 
  saveTransactionToFirestore, 
  deleteTransactionFromFirestore,
  getTransactionsFromFirestore
} from '../../services/firestoreService'

// Initial state: start with an empty transactions array.
// The app will initialize and load data from Firestore via initializeFirestoreSync.
const initialState = {
  transactions: [],
  selectedMonth: new Date().toISOString().slice(0, 7),
  isSyncing: false,
  syncError: null,
}

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions: (state, action) => {
      state.transactions = action.payload
    },
    addTransaction: (state, action) => {
      const newTransaction = {
        id: Date.now(),
        type: action.payload.type || 'expense',
        ...action.payload,
        createdBy: action.payload.createdBy || action.payload.username || action.payload.userEmail || 'Unknown',
        createdAt: new Date().toISOString()
      }
      state.transactions.push(newTransaction)
      // Sync to Firestore (async, don't wait) - userId will be passed from component
      if (action.payload.userId) {
        saveTransactionToFirestore(newTransaction, action.payload.userId).catch(err => {
          console.warn('Failed to sync transaction to Firestore:', err)
        })
      }
    },
    editTransaction: (state, action) => {
      const { id, updatedData, userId, username } = action.payload
      const index = state.transactions.findIndex(t => t.id === id)
      if (index !== -1) {
        // Preserve createdBy and createdAt, add edit tracking
        const existingTransaction = state.transactions[index]
        const now = new Date().toISOString()
        
        // Track changes by comparing old vs new values
        const changes = []
        const fieldsToTrack = ['amount', 'description', 'category', 'date', 'type']
        
        fieldsToTrack.forEach(field => {
          const oldValue = existingTransaction[field]
          const newValue = updatedData[field]
          
          // Only track if value actually changed
          if (newValue !== undefined && String(oldValue) !== String(newValue)) {
            changes.push({
              field: field,
              oldValue: oldValue,
              newValue: newValue
            })
          }
        })
        
        // Get existing edit history or create new array
        const editHistory = existingTransaction.editHistory || []
        
        // Add new changes to history if any
        if (changes.length > 0) {
          editHistory.push({
            changes: changes,
            editedBy: username || 'Unknown',
            editedAt: now
          })
        }
        
        state.transactions[index] = { 
          ...existingTransaction,
          ...updatedData,
          createdBy: existingTransaction.createdBy || 'Unknown',
          createdAt: existingTransaction.createdAt || now,
          updatedAt: now,
          editedBy: username || 'Unknown',
          editedAt: now,
          editHistory: editHistory // Store full edit history
        }
        // Sync to Firestore (async, don't wait)
        if (userId) {
          saveTransactionToFirestore(state.transactions[index], userId).catch(err => {
            console.warn('Failed to sync transaction to Firestore:', err)
          })
        }
      }
    },
    deleteTransaction: (state, action) => {
      const { transactionId, userId } = action.payload
      state.transactions = state.transactions.filter(t => t.id !== transactionId)
      // Sync to Firestore (async, don't wait)
      if (userId) {
        deleteTransactionFromFirestore(transactionId, userId).catch(err => {
          console.warn('Failed to delete transaction from Firestore:', err)
        })
      }
    },
    setSelectedMonth: (state, action) => {
      state.selectedMonth = action.payload
    },
    setSyncing: (state, action) => {
      state.isSyncing = action.payload
    },
    setSyncError: (state, action) => {
      state.syncError = action.payload
    },
  },
})

export const { 
  addTransaction, 
  editTransaction, 
  deleteTransaction, 
  setSelectedMonth,
  setTransactions,
  setSyncing,
  setSyncError
} = transactionsSlice.actions

// Helper function to initialize and sync with Firestore
export const initializeFirestoreSync = async (dispatch, userId) => {
  if (!userId) {
    // No user authenticated, skip Firestore sync
    dispatch(setTransactions([]))
    return
  }

  try {
    dispatch(setSyncing(true))
    dispatch(setSyncError(null))

    // Load from Firestore
    const firestoreTransactions = await getTransactionsFromFirestore(userId)

    if (firestoreTransactions && firestoreTransactions.length > 0) {
      // Use Firestore data
      dispatch(setTransactions(firestoreTransactions))
    } else {
      // No data in Firestore, start with empty array
      dispatch(setTransactions([]))
    }
  } catch (error) {
    console.error('Error initializing Firestore sync:', error)
    dispatch(setSyncError('Failed to sync with cloud storage.'))
    // Start with empty array if Firestore fails
    dispatch(setTransactions([]))
  } finally {
    dispatch(setSyncing(false))
  }
}

export default transactionsSlice.reducer

