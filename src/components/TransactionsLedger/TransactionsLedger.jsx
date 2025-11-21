import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { editTransaction, deleteTransaction } from '../../store/slices/transactionsSlice'
import Dialog from '../Dialog/Dialog'
import './TransactionsLedger.css'

function TransactionsLedger() {
  const dispatch = useDispatch()
  const transactions = useSelector((state) => state.transactions.transactions)
  const selectedMonth = useSelector((state) => state.transactions.selectedMonth)
  
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, transactionId: null, transaction: null })

  const expenseCategories = ['Food', 'Utilities', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Other']
  const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']

  const filteredTransactions = transactions.filter(t => t.date.startsWith(selectedMonth))
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const handleEditClick = (transaction) => {
    setEditingId(transaction.id)
    setEditForm({
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      date: transaction.date,
      type: transaction.type
    })
  }

  const handleSaveEdit = (id) => {
    dispatch(editTransaction({ id, updatedData: editForm }))
    setEditingId(null)
    setEditForm({})
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleDeleteClick = (transaction) => {
    setDeleteDialog({
      isOpen: true,
      transactionId: transaction.id,
      transaction: transaction
    })
  }

  const handleDeleteConfirm = () => {
    if (deleteDialog.transactionId) {
      dispatch(deleteTransaction(deleteDialog.transactionId))
    }
    setDeleteDialog({ isOpen: false, transactionId: null, transaction: null })
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, transactionId: null, transaction: null })
  }

  const handleInputChange = (e) => {
    const newFormData = {
      ...editForm,
      [e.target.name]: e.target.value
    }
    
    // Reset category when type changes
    if (e.target.name === 'type') {
      newFormData.category = e.target.value === 'income' ? 'Salary' : 'Food'
    }
    
    setEditForm(newFormData)
  }

  const getCategoriesForType = (type) => {
    return type === 'income' ? incomeCategories : expenseCategories
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
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
      Salary: '💼',
      Other: '📝'
    }
    return icons[category] || '📝'
  }

  if (filteredTransactions.length === 0) {
    return (
      <div className="transactions-ledger">
        <h2>Transactions Ledger</h2>
        <div className="empty-ledger">
          <p>No transactions for this month</p>
        </div>
      </div>
    )
  }

  return (
    <div className="transactions-ledger">
      <h2>Transactions Ledger</h2>
      
      {/* Mobile Card View */}
      <div className="ledger-cards">
        {filteredTransactions.map(transaction => (
          <div key={transaction.id} className={`transaction-card ${transaction.type === 'income' ? 'income-card' : 'expense-card'}`}>
            {editingId === transaction.id ? (
              <div className="transaction-card-edit">
                <div className="edit-form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={editForm.date}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                </div>
                <div className="edit-form-group">
                  <label>Type</label>
                  <select
                    name="type"
                    value={editForm.type}
                    onChange={handleInputChange}
                    className="edit-select"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div className="edit-form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    name="description"
                    value={editForm.description}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                </div>
                <div className="edit-form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleInputChange}
                    className="edit-select"
                  >
                    {getCategoriesForType(editForm.type).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="edit-form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={editForm.amount}
                    onChange={handleInputChange}
                    step="0.01"
                    className="edit-input"
                  />
                </div>
                <div className="card-action-buttons">
                  <button
                    onClick={() => handleSaveEdit(transaction.id)}
                    className="save-btn"
                  >
                    ✓ Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="cancel-btn"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="transaction-card-header">
                  <div className="transaction-main-info">
                    <h3 className="transaction-description">{transaction.description}</h3>
                    <span className={`transaction-amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount))}
                    </span>
                  </div>
                </div>
                <div className="transaction-card-body">
                  <div className="transaction-meta">
                    <div className="transaction-meta-item">
                      <span className="meta-label">Date:</span>
                      <span className="meta-value">{formatDate(transaction.date)}</span>
                    </div>
                    <div className="transaction-meta-item">
                      <span className="meta-label">Type:</span>
                      <span className={`type-badge ${transaction.type}`}>
                        {transaction.type === 'income' ? '💰 Income' : '💸 Expense'}
                      </span>
                    </div>
                    <div className="transaction-meta-item">
                      <span className="meta-label">Category:</span>
                      <span className="category-badge">
                        {getCategoryIcon(transaction.category)} {transaction.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="transaction-card-footer">
                  <button
                    onClick={() => handleEditClick(transaction)}
                    className="card-edit-btn"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(transaction)}
                    className="card-delete-btn"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="ledger-table-container">
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(transaction => (
              <tr key={transaction.id} className={transaction.type === 'income' ? 'income-row' : 'expense-row'}>
                {editingId === transaction.id ? (
                  <>
                    <td>
                      <input
                        type="date"
                        name="date"
                        value={editForm.date}
                        onChange={handleInputChange}
                        className="edit-input"
                      />
                    </td>
                    <td>
                      <select
                        name="type"
                        value={editForm.type}
                        onChange={handleInputChange}
                        className="edit-select"
                      >
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        name="description"
                        value={editForm.description}
                        onChange={handleInputChange}
                        className="edit-input"
                      />
                    </td>
                    <td>
                      <select
                        name="category"
                        value={editForm.category}
                        onChange={handleInputChange}
                        className="edit-select"
                      >
                        {getCategoriesForType(editForm.type).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        name="amount"
                        value={editForm.amount}
                        onChange={handleInputChange}
                        step="0.01"
                        className="edit-input"
                      />
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleSaveEdit(transaction.id)}
                          className="save-btn"
                          title="Save"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="cancel-btn"
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{formatDate(transaction.date)}</td>
                    <td>
                      <span className={`type-badge ${transaction.type}`}>
                        {transaction.type === 'income' ? '💰 Income' : '💸 Expense'}
                      </span>
                    </td>
                    <td className="description-cell">{transaction.description}</td>
                    <td>
                      <span className="category-badge">
                        {getCategoryIcon(transaction.category)} {transaction.category}
                      </span>
                    </td>
                    <td className={`amount-cell ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount))}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEditClick(transaction)}
                          className="edit-btn"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteClick(transaction)}
                          className="delete-btn"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        message={
          deleteDialog.transaction
            ? `Are you sure you want to delete "${deleteDialog.transaction.description}" (${formatCurrency(parseFloat(deleteDialog.transaction.amount))})? This action cannot be undone.`
            : 'Are you sure you want to delete this transaction? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  )
}

export default TransactionsLedger
