import { createSlice } from '@reduxjs/toolkit'

// Mock data for testing
const getMockData = () => {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0')
  
  return [
    // Income
    {
      id: 1001,
      type: 'income',
      amount: '50000.00',
      description: 'Monthly Salary',
      category: 'Salary',
      date: `${currentYear}-${currentMonth}-01`
    },
    {
      id: 1002,
      type: 'income',
      amount: '5000.00',
      description: 'Freelance Project',
      category: 'Freelance',
      date: `${currentYear}-${currentMonth}-15`
    },
    // Expenses
    {
      id: 2001,
      type: 'expense',
      amount: '3500.00',
      description: 'Grocery Shopping',
      category: 'Food',
      date: `${currentYear}-${currentMonth}-02`
    },
    {
      id: 2002,
      type: 'expense',
      amount: '2500.00',
      description: 'Electricity Bill',
      category: 'Utilities',
      date: `${currentYear}-${currentMonth}-05`
    },
    {
      id: 2003,
      type: 'expense',
      amount: '1200.00',
      description: 'Internet Bill',
      category: 'Bills',
      date: `${currentYear}-${currentMonth}-05`
    },
    {
      id: 2004,
      type: 'expense',
      amount: '800.00',
      description: 'Uber Rides',
      category: 'Transport',
      date: `${currentYear}-${currentMonth}-08`
    },
    {
      id: 2005,
      type: 'expense',
      amount: '1500.00',
      description: 'Restaurant Dinner',
      category: 'Food',
      date: `${currentYear}-${currentMonth}-10`
    },
    {
      id: 2006,
      type: 'expense',
      amount: '3000.00',
      description: 'Shopping - Clothes',
      category: 'Shopping',
      date: `${currentYear}-${currentMonth}-12`
    },
    {
      id: 2007,
      type: 'expense',
      amount: '500.00',
      description: 'Movie Tickets',
      category: 'Entertainment',
      date: `${currentYear}-${currentMonth}-14`
    },
    {
      id: 2008,
      type: 'expense',
      amount: '2000.00',
      description: 'Petrol',
      category: 'Transport',
      date: `${currentYear}-${currentMonth}-16`
    },
    {
      id: 2009,
      type: 'expense',
      amount: '1800.00',
      description: 'Medical Checkup',
      category: 'Healthcare',
      date: `${currentYear}-${currentMonth}-18`
    },
    {
      id: 2010,
      type: 'expense',
      amount: '1200.00',
      description: 'Water Bill',
      category: 'Utilities',
      date: `${currentYear}-${currentMonth}-20`
    },
    {
      id: 2011,
      type: 'expense',
      amount: '2500.00',
      description: 'Monthly Groceries',
      category: 'Food',
      date: `${currentYear}-${currentMonth}-22`
    },
    {
      id: 2012,
      type: 'expense',
      amount: '1500.00',
      description: 'Netflix Subscription',
      category: 'Entertainment',
      date: `${currentYear}-${currentMonth}-25`
    }
  ]
}

// Load initial state from localStorage
const loadInitialState = () => {
  const savedTransactions = localStorage.getItem('transactions')
  if (savedTransactions) {
    try {
      const parsed = JSON.parse(savedTransactions)
      // Only return saved data if it exists, otherwise use mock data
      if (parsed.length > 0) {
        return parsed
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    }
  }
  
  // Migrate old 'expenses' data if it exists
  const savedExpenses = localStorage.getItem('expenses')
  if (savedExpenses) {
    try {
      const parsed = JSON.parse(savedExpenses)
      const migrated = parsed.map(exp => ({
        ...exp,
        type: exp.type || 'expense'
      }))
      if (migrated.length > 0) {
        localStorage.setItem('transactions', JSON.stringify(migrated))
        localStorage.removeItem('expenses')
        return migrated
      }
    } catch (error) {
      console.error('Error migrating expenses:', error)
    }
  }
  
  // Return mock data if no saved data exists
  const mockData = getMockData()
  localStorage.setItem('transactions', JSON.stringify(mockData))
  return mockData
}

const initialState = {
  transactions: loadInitialState(),
  selectedMonth: new Date().toISOString().slice(0, 7),
}

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransaction: (state, action) => {
      const newTransaction = {
        id: Date.now(),
        type: action.payload.type || 'expense',
        ...action.payload
      }
      state.transactions.push(newTransaction)
      // Save to localStorage
      localStorage.setItem('transactions', JSON.stringify(state.transactions))
    },
    editTransaction: (state, action) => {
      const { id, updatedData } = action.payload
      const index = state.transactions.findIndex(t => t.id === id)
      if (index !== -1) {
        state.transactions[index] = { ...state.transactions[index], ...updatedData }
        // Save to localStorage
        localStorage.setItem('transactions', JSON.stringify(state.transactions))
      }
    },
    deleteTransaction: (state, action) => {
      state.transactions = state.transactions.filter(t => t.id !== action.payload)
      // Save to localStorage
      localStorage.setItem('transactions', JSON.stringify(state.transactions))
    },
    setSelectedMonth: (state, action) => {
      state.selectedMonth = action.payload
    },
  },
})

export const { addTransaction, editTransaction, deleteTransaction, setSelectedMonth } = transactionsSlice.actions

export default transactionsSlice.reducer

