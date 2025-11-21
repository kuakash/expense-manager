import { createSlice } from '@reduxjs/toolkit'
import { 
  saveTransactionToFirestore, 
  deleteTransactionFromFirestore,
  saveAllTransactionsToFirestore,
  syncLocalStorageToFirestore,
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
      // Save to localStorage as backup
      localStorage.setItem('transactions', JSON.stringify(action.payload))
    },
    addTransaction: (state, action) => {
      const newTransaction = {
        id: Date.now(),
        type: action.payload.type || 'expense',
        ...action.payload
      }
      state.transactions.push(newTransaction)
      // Save to localStorage
      localStorage.setItem('transactions', JSON.stringify(state.transactions))
      // Sync to Firestore (async, don't wait)
      saveTransactionToFirestore(newTransaction).catch(err => {
        console.warn('Failed to sync transaction to Firestore:', err)
      })
    },
    editTransaction: (state, action) => {
      const { id, updatedData } = action.payload
      const index = state.transactions.findIndex(t => t.id === id)
      if (index !== -1) {
        state.transactions[index] = { ...state.transactions[index], ...updatedData }
        // Save to localStorage
        localStorage.setItem('transactions', JSON.stringify(state.transactions))
        // Sync to Firestore (async, don't wait)
        saveTransactionToFirestore(state.transactions[index]).catch(err => {
          console.warn('Failed to sync transaction to Firestore:', err)
        })
      }
    },
    deleteTransaction: (state, action) => {
      const transactionId = action.payload
      state.transactions = state.transactions.filter(t => t.id !== transactionId)
      // Save to localStorage
      localStorage.setItem('transactions', JSON.stringify(state.transactions))
      // Sync to Firestore (async, don't wait)
      deleteTransactionFromFirestore(transactionId).catch(err => {
        console.warn('Failed to delete transaction from Firestore:', err)
      })
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
export const initializeFirestoreSync = async (dispatch) => {
  try {
    dispatch(setSyncing(true))
    dispatch(setSyncError(null))

    // Migrate legacy 'expenses' key to 'transactions' if present (one-time)
    try {
      const savedExpenses = localStorage.getItem('expenses')
      if (savedExpenses) {
        const parsed = JSON.parse(savedExpenses)
        const migrated = parsed.map(exp => ({
          ...exp,
          type: exp.type || 'expense'
        }))
        if (migrated.length > 0) {
          localStorage.setItem('transactions', JSON.stringify(migrated))
          localStorage.removeItem('expenses')
        }
      }
    } catch (err) {
      console.warn('Failed to migrate legacy expenses key:', err)
    }

    // Try to sync localStorage to Firestore (one-time migration)
    await syncLocalStorageToFirestore()

    // Load from Firestore
    const firestoreTransactions = await getTransactionsFromFirestore()

    if (firestoreTransactions && firestoreTransactions.length > 0) {
      // Use Firestore data
      dispatch(setTransactions(firestoreTransactions))
    } else {
      // Fallback to localStorage
      const localData = localStorage.getItem('transactions')
      if (localData) {
        const parsed = JSON.parse(localData)
        if (parsed.length > 0) {
          dispatch(setTransactions(parsed))
          // Sync to Firestore
          await saveAllTransactionsToFirestore(parsed)
        }
      }
    }
  } catch (error) {
    console.error('Error initializing Firestore sync:', error)
    dispatch(setSyncError('Failed to sync with cloud storage. Using local data.'))
    // Fallback to localStorage
    const localData = localStorage.getItem('transactions')
    if (localData) {
      try {
        const parsed = JSON.parse(localData)
        dispatch(setTransactions(parsed))
      } catch (e) {
        console.error('Error loading from localStorage:', e)
      }
    }
  } finally {
    dispatch(setSyncing(false))
  }
}

export default transactionsSlice.reducer

