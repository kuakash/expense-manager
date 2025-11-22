import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import './Dialog.css'

function Dialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger', children, showFooter = true, maxWidth = '420px' }) {
  // Handle ESC key to close dialog
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  const dialogContent = (
    <div className="dialog-overlay" onClick={handleBackdropClick}>
      <div className="dialog-container" style={{ maxWidth }}>
        <div className="dialog-header">
          <h3 className="dialog-title">{title}</h3>
          <button className="dialog-close-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="dialog-body">
          {children || <p className="dialog-message">{message}</p>}
        </div>
        {showFooter && (
          <div className="dialog-footer">
            {onConfirm ? (
              <>
                <button 
                  className="dialog-btn dialog-btn-cancel" 
                  onClick={onClose}
                >
                  {cancelText}
                </button>
                <button 
                  className={`dialog-btn dialog-btn-confirm dialog-btn-${type}`}
                  onClick={onConfirm}
                >
                  {confirmText}
                </button>
              </>
            ) : (
              <button 
                className="dialog-btn dialog-btn-cancel" 
                onClick={onClose}
              >
                {cancelText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(dialogContent, document.body)
}

export default Dialog

