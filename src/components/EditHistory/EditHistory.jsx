import { useState } from 'react'
import Dialog from '../Dialog/Dialog'
import './EditHistory.css'

function EditHistory({ transaction }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!transaction.editHistory || transaction.editHistory.length === 0) {
    return null
  }

  const formatFieldName = (field) => {
    const fieldNames = {
      amount: 'Amount',
      description: 'Description',
      category: 'Category',
      date: 'Date',
      type: 'Type'
    }
    return fieldNames[field] || field
  }

  const formatValue = (field, value) => {
    if (field === 'amount') {
      return `₹${parseFloat(value).toFixed(2)}`
    }
    if (field === 'date') {
      return new Date(value).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    }
    if (field === 'type') {
      return value === 'income' ? 'Income' : 'Expense'
    }
    return value
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="edit-history-btn"
        title="View edit history"
      >
        📝 History
      </button>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Edit History"
        cancelText="Close"
        showFooter={true}
        maxWidth="600px"
      >
        <div className="edit-history-content">
          <div className="edit-history-summary">
            <p>
              <strong>Created by:</strong> {transaction.createdBy || 'Unknown'} on{' '}
              {formatDate(transaction.createdAt)}
            </p>
            <p>
              <strong>Total edits:</strong> {transaction.editHistory.length}
            </p>
          </div>

          <div className="edit-history-list">
            {transaction.editHistory.map((edit, index) => (
              <div key={index} className="edit-history-item">
                <div className="edit-history-header">
                  <span className="edit-history-number">Edit #{transaction.editHistory.length - index}</span>
                  <span className="edit-history-meta">
                    by {edit.editedBy} on {formatDate(edit.editedAt)}
                  </span>
                </div>
                <div className="edit-history-changes">
                  {edit.changes.map((change, changeIndex) => (
                    <div key={changeIndex} className="change-item">
                      <div className="change-field">{formatFieldName(change.field)}:</div>
                      <div className="change-values">
                        <span className="change-old">
                          <span className="change-label">From:</span> {formatValue(change.field, change.oldValue)}
                        </span>
                        <span className="change-arrow">→</span>
                        <span className="change-new">
                          <span className="change-label">To:</span> {formatValue(change.field, change.newValue)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default EditHistory


