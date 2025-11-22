import { useState } from 'react'
import { signIn, resetPassword } from '../../services/authService'
import './Auth.css'

function Auth({ onAuthSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const result = await signIn(email, password)

      if (result.error) {
        setError(result.error)
      } else if (result.user) {
        onAuthSuccess()
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!email) {
      setError('Please enter your email address.')
      setLoading(false)
      return
    }

    try {
      const result = await resetPassword(email)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess('Password reset email sent! Check your inbox and follow the instructions to reset your password.')
        setShowResetPassword(false)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleResetPassword = () => {
    setShowResetPassword(!showResetPassword)
    setError('')
    setSuccess('')
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>💰 Expense Tracker</h1>
          <p className="auth-subtitle">
            {showResetPassword ? 'Reset your password' : 'Sign in to continue'}
          </p>
        </div>

        {showResetPassword ? (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="auth-form-group">
              <label htmlFor="reset-email">Email</label>
              <input
                type="email"
                id="reset-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <p style={{ 
              color: '#94a3b8', 
              fontSize: '0.875rem', 
              margin: '0 0 20px 0',
              lineHeight: '1.5'
            }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {success && (
              <div className="auth-success">
                {success}
              </div>
            )}

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="auth-switch">
              <button 
                type="button" 
                onClick={toggleResetPassword}
                className="auth-switch-btn"
                disabled={loading}
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignIn} className="auth-form">
            <div className="auth-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="auth-form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                autoComplete="current-password"
                minLength={6}
              />
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {success && (
              <div className="auth-success">
                {success}
              </div>
            )}

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Please wait...' : 'Sign In'}
            </button>

            <div className="auth-switch">
              <button 
                type="button" 
                onClick={toggleResetPassword}
                className="auth-switch-btn"
                disabled={loading}
              >
                Forgot Password?
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Auth

