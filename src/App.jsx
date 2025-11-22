import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setSelectedMonth, initializeFirestoreSync, setTransactions } from './store/slices/transactionsSlice'
import { onAuthStateChange, logOut, getCurrentUser } from './services/authService'
import { getUserProfile } from './services/userProfileService'
import { getTransactionsFromFirestore } from './services/firestoreService'
import Dashboard from './components/Dashboard/Dashboard'
import TransactionsLedger from './components/TransactionsLedger/TransactionsLedger'
import ExpenseForm from './components/ExpenseForm/ExpenseForm'
import Auth from './components/Auth/Auth'
import UsernameSetup from './components/UsernameSetup/UsernameSetup'
import UsernameSettings from './components/UsernameSettings/UsernameSettings'
import './App.css'

function App() {
  const dispatch = useDispatch()
  const selectedMonth = useSelector((state) => state.transactions.selectedMonth)
  const isSyncing = useSelector((state) => state.transactions.isSyncing)
  const syncError = useSelector((state) => state.transactions.syncError)
  const [currentView, setCurrentView] = useState('dashboard') // 'dashboard' or 'transactions'
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [usernameLoading, setUsernameLoading] = useState(true)

  // Monitor authentication state
  useEffect(() => {
    let isMounted = true
    
    // Set a fallback timeout to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      if (isMounted && (authLoading || usernameLoading)) {
        console.warn('Auth loading timeout - forcing state update')
        setAuthLoading(false)
        setUsernameLoading(false)
      }
    }, 5000) // 5 second fallback
    
    const unsubscribe = onAuthStateChange(async (user) => {
      clearTimeout(fallbackTimeout)
      
      if (!isMounted) return
      
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out')
      setUser(user)
      setAuthLoading(false)
      
      if (user) {
        // Load user profile (username) with timeout
        try {
          console.log('App: Loading user profile for:', user.uid)
          // Add timeout to prevent infinite loading
          const profilePromise = getUserProfile(user.uid)
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout loading user profile')), 5000)
          )
          
          const profile = await Promise.race([profilePromise, timeoutPromise])
          
          if (!isMounted) return
          
          console.log('App: Profile loaded:', profile)
          
          if (profile?.username) {
            console.log('App: Username found:', profile.username)
            setUsername(profile.username)
          } else {
            console.log('App: No username found in profile')
            setUsername(null) // No username set yet
          }
        } catch (error) {
          console.error('App: Error loading user profile:', error)
          if (isMounted) {
            setUsername(null)
          }
        } finally {
          if (isMounted) {
            console.log('App: Setting usernameLoading to false')
            setUsernameLoading(false)
          }
        }
        
        // Initialize Firestore sync when user is authenticated
        initializeFirestoreSync(dispatch, user.uid)
      } else {
        // Clear transactions and username when user logs out
        dispatch({ type: 'transactions/setTransactions', payload: [] })
        setUsername(null)
        setUsernameLoading(false) // Don't keep loading if no user
      }
    })

    return () => {
      isMounted = false
      clearTimeout(fallbackTimeout)
      unsubscribe()
    }
  }, [dispatch])

  const handleAuthSuccess = async () => {
    // Auth state change will be handled by onAuthStateChange
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      // Load username
      try {
        const profile = await getUserProfile(currentUser.uid)
        if (profile?.username) {
          setUsername(profile.username)
        } else {
          setUsername(null)
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
        setUsername(null)
      } finally {
        setUsernameLoading(false)
      }
      initializeFirestoreSync(dispatch, currentUser.uid)
    }
  }

  const handleUsernameSet = (newUsername) => {
    setUsername(newUsername)
    setUsernameLoading(false)
  }

  const handleUsernameChanged = async (newUsername) => {
    setUsername(newUsername)
    // Reload transactions to reflect updated usernames
    if (user) {
      try {
        const transactions = await getTransactionsFromFirestore(user.uid)
        if (transactions) {
          dispatch(setTransactions(transactions))
        }
      } catch (error) {
        console.error('Error reloading transactions after username change:', error)
      }
    }
  }

  const handleLogout = async () => {
    await logOut()
    // Auth state change will clear user and transactions
  }

  const handleMonthChange = (month) => {
    dispatch(setSelectedMonth(month))
  }

  // Show loading state while checking auth
  if (authLoading || usernameLoading) {
    return (
      <div className="app">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          color: '#cbd5e1',
          gap: '12px'
        }}>
          <div>Loading...</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            If this takes too long, check your browser console for errors
          </div>
        </div>
      </div>
    )
  }

  // Show auth screen if not logged in
  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />
  }

  // Show username setup if user doesn't have a username
  if (!username) {
    return (
      <UsernameSetup 
        userId={user.uid} 
        userEmail={user.email}
        onComplete={handleUsernameSet}
      />
    )
  }

  return (
    <div className="app">
      <main className="app-main">
        <button
          onClick={handleLogout}
          className="signout-btn"
        >
          Sign Out
        </button>
        <header className="app-header">
          <div className="app-header-content">
            <h1>💰 Expense Tracker</h1>
            <p className="subtitle">Track your income and expenses</p>
            <div style={{ 
              marginTop: '8px', 
              fontSize: '0.75rem', 
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <span>Signed in as: <strong>{username}</strong> ({user.email})</span>
              <UsernameSettings 
                userId={user.uid}
                userEmail={user.email}
                currentUsername={username}
                onUsernameChanged={handleUsernameChanged}
              />
            </div>
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
            <ExpenseForm userId={user.uid} username={username} />
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
            <ExpenseForm userId={user.uid} username={username} />
            <TransactionsLedger userId={user.uid} username={username} />
          </>
        )}
      </main>
    </div>
  )
}

export default App
