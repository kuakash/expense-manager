import { useState, useEffect } from 'react'
import { setUsername, getUserProfile } from '../../services/userProfileService'
import './UsernameSettings.css'

function UsernameSettings({ userId, userEmail, currentUsername, onUsernameChanged }) {
  const [username, setUsernameValue] = useState(currentUsername || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setUsernameValue(currentUsername || '')
  }, [currentUsername])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!username.trim()) {
      setError('Please enter a username')
      return
    }

    if (username.trim() === currentUsername) {
      setIsOpen(false)
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
      await setUsername(userId, username.trim(), userEmail, true) // Pass true to update transactions
      onUsernameChanged(username.trim())
      setIsOpen(false)
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to update username. Please try again.')
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="username-settings-btn"
        title="Change username"
      >
        ✏️ Change Username
      </button>
    )
  }

  return (
    <div className="username-settings-overlay" onClick={() => setIsOpen(false)}>
      <div className="username-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="username-settings-header">
          <h3>Change Username</h3>
          <button
            onClick={() => {
              setIsOpen(false)
              setError('')
              setUsernameValue(currentUsername || '')
            }}
            className="username-settings-close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="username-settings-form">
          <div className="username-settings-group">
            <label htmlFor="change-username">New Username</label>
            <input
              type="text"
              id="change-username"
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
            <small className="username-settings-hint">
              3-20 characters, letters, numbers, and underscores only
            </small>
          </div>

          {error && (
            <div className="username-settings-error">
              {error}
            </div>
          )}

          <div className="username-settings-actions">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                setError('')
                setUsernameValue(currentUsername || '')
              }}
              className="username-settings-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="username-settings-save"
              disabled={loading || !username.trim() || username.trim() === currentUsername}
            >
              {loading ? 'Updating...' : 'Update Username'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UsernameSettings

