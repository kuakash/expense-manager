import './ExpenseList.css'

function ExpenseList({ expenses, onDeleteExpense }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getCategoryIcon = (category) => {
    const icons = {
      Food: '🍔',
      Utilities: '💡',
      Transport: '🚗',
      Shopping: '🛍️',
      Bills: '📄',
      Entertainment: '🎬',
      Healthcare: '🏥',
      Other: '📝'
    }
    return icons[category] || '📝'
  }

  if (expenses.length === 0) {
    return (
      <div className="expense-list">
        <h2>Expenses</h2>
        <div className="empty-state">
          <p>No expenses recorded for this month.</p>
          <p className="hint">Add your first expense above!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="expense-list">
      <h2>Expenses</h2>
      <div className="expenses-container">
        {expenses.map(expense => (
          <div key={expense.id} className="expense-item">
            <div className="expense-icon">
              {getCategoryIcon(expense.category)}
            </div>
            <div className="expense-details">
              <div className="expense-header">
                <h3>{expense.description}</h3>
                <span className="expense-amount">₹{parseFloat(expense.amount).toFixed(2)}</span>
              </div>
              <div className="expense-meta">
                <span className="expense-category">{expense.category}</span>
                <span className="expense-date">{formatDate(expense.date)}</span>
              </div>
            </div>
            <button 
              className="delete-btn"
              onClick={() => onDeleteExpense(expense.id)}
              aria-label="Delete expense"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ExpenseList

