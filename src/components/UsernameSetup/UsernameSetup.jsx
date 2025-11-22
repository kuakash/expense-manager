import { useState, useEffect } from 'react'
import { setUsername, getUserProfile } from '../../services/userProfileService'
import './UsernameSetup.css'

function UsernameSetup({ userId, userEmail, onComplete }) {
  const [username, setUsernameValue] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Check if user already has a username
    const checkUsername = async () => {
      try {
        const profile = await getUserProfile(userId)
        if (profile?.username) {
          // User already has username, skip setup
          onComplete(profile.username)
        } else {
          setChecking(false)
        }
      } catch (err) {
        console.error('Error checking username:', err)
        setChecking(false)
      }
    }
    
    if (userId) {
      checkUsername()
    }
  }, [userId, onComplete])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!username.trim()) {
      setError('Please enter a username')
      return
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    if (username.length > 20) {
      setError('Username must be less than 20 characters')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores')
      return
    }

    setLoading(true)
    try {
      await setUsername(userId, username.trim(), userEmail)
      onComplete(username.trim())
    } catch (err) {
      setError(err.message || 'Failed to set username. Please try again.')
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="username-setup-container">
        <div className="username-setup-card">
          <div className="username-setup-loading">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="username-setup-container">
      <div className="username-setup-card">
        <div className="username-setup-header">
          <h2>Set Your Username</h2>
          <p>Choose a username to identify yourself in transactions</p>
        </div>

        <form onSubmit={handleSubmit} className="username-setup-form">
          <div className="username-form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => {
                setUsernameValue(e.target.value)
                setError('')
              }}
              placeholder="e.g., john_doe"
              required
              disabled={loading}
              autoComplete="off"
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
            />
            <small className="username-hint">
              3-20 characters, letters, numbers, and underscores only
            </small>
          </div>

          {error && (
            <div className="username-error">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="username-submit-btn"
            disabled={loading || !username.trim()}
          >
            {loading ? 'Setting...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default UsernameSetup

