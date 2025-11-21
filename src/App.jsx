import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setSelectedMonth, initializeFirestoreSync } from './store/slices/transactionsSlice'
import Dashboard from './components/Dashboard/Dashboard'
import TransactionsLedger from './components/TransactionsLedger/TransactionsLedger'
import ExpenseForm from './components/ExpenseForm/ExpenseForm'
import './App.css'

function App() {
  const dispatch = useDispatch()
  const selectedMonth = useSelector((state) => state.transactions.selectedMonth)
  const isSyncing = useSelector((state) => state.transactions.isSyncing)
  const syncError = useSelector((state) => state.transactions.syncError)
  const [currentView, setCurrentView] = useState('dashboard') // 'dashboard' or 'transactions'

  // Initialize Firestore sync on app load
  useEffect(() => {
    initializeFirestoreSync(dispatch)
  }, [dispatch])

  const handleMonthChange = (month) => {
    dispatch(setSelectedMonth(month))
  }

  return (
    <div className="app">
      <main className="app-main">
        <header className="app-header">
          <div className="app-header-content">
            <h1>💰 Expense Tracker</h1>
            <p className="subtitle">Track your income and expenses</p>
          </div>
          {isSyncing && (
            <div className="sync-indicator">
              <span className="sync-text">Syncing...</span>
            </div>
          )}
          {syncError && (
            <div className="sync-error">
              <span className="sync-error-text">{syncError}</span>
            </div>
          )}
        </header>

        <nav className="app-nav">
          <button 
            className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-btn ${currentView === 'transactions' ? 'active' : ''}`}
            onClick={() => setCurrentView('transactions')}
          >
            📝 Transactions
          </button>
        </nav>
        {currentView === 'dashboard' && (
          <>
            <Dashboard />
            <ExpenseForm />
          </>
        )}

        {currentView === 'transactions' && (
          <>
            <div className="view-header">
              <h2>Transactions</h2>
              <div className="month-selector">
                <label htmlFor="month">Select Month:</label>
                <input
                  type="month"
                  id="month"
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="month-input"
                />
              </div>
            </div>
            <ExpenseForm />
            <TransactionsLedger />
          </>
        )}
      </main>
    </div>
  )
}

export default App
