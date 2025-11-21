import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setSelectedMonth } from './store/slices/transactionsSlice'
import Dashboard from './components/Dashboard/Dashboard'
import TransactionsLedger from './components/TransactionsLedger/TransactionsLedger'
import ExpenseForm from './components/ExpenseForm/ExpenseForm'
import './App.css'

function App() {
  const dispatch = useDispatch()
  const selectedMonth = useSelector((state) => state.transactions.selectedMonth)
  const [currentView, setCurrentView] = useState('dashboard') // 'dashboard' or 'transactions'

  const handleMonthChange = (month) => {
    dispatch(setSelectedMonth(month))
  }

  return (
    <div className="app">
      <main className="app-main">
        <header className="app-header">
          <h1>💰 Expense Tracker</h1>
          <p className="subtitle">Track your income and expenses</p>
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
