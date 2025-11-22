import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { editTransaction, deleteTransaction } from '../../store/slices/transactionsSlice'
import Dialog from '../Dialog/Dialog'
import EditHistory from '../EditHistory/EditHistory'
import './TransactionsLedger.css'

function TransactionsLedger({ userId, username }) {
  const dispatch = useDispatch()
  const transactions = useSelector((state) => state.transactions.transactions)
  const selectedMonth = useSelector((state) => state.transactions.selectedMonth)
  
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, transactionId: null, transaction: null })
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    minAmount: '',
    maxAmount: '',
    createdBy: 'all',
    search: ''
  })

  const expenseCategories = ['Bills', 'Entertainment', 'Food', 'Fuel', 'Gift', 'Healthcare', 'Loan', 'Other', 'Shopping', 'Transport', 'Utilities']
  const incomeCategories = ['Gift', 'Investment', 'Other', 'Salary']
  const allCategories = [...new Set([...expenseCategories, ...incomeCategories])].sort()

  // Get unique creators from transactions
  const uniqueCreators = [...new Set(transactions.map(t => t.createdBy).filter(Boolean))].sort()

  // Apply filters
  const filteredTransactions = transactions
    .filter(t => {
      // Month filter
      if (!t.date.startsWith(selectedMonth)) return false
      
      // Type filter
      if (filters.type !== 'all' && t.type !== filters.type) return false
      
      // Category filter
      if (filters.category !== 'all' && t.category !== filters.category) return false
      
      // Amount filters
      const amount = parseFloat(t.amount)
      if (filters.minAmount && amount < parseFloat(filters.minAmount)) return false
      if (filters.maxAmount && amount > parseFloat(filters.maxAmount)) return false
      
      // Creator filter
      if (filters.createdBy !== 'all' && t.createdBy !== filters.createdBy) return false
      
      // Search filter (description)
      if (filters.search && !t.description.toLowerCase().includes(filters.search.toLowerCase())) return false
      
      return true
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      type: 'all',
      category: 'all',
      minAmount: '',
      maxAmount: '',
      createdBy: 'all',
      search: ''
    })
  }

  const activeFiltersCount = Object.values(filters).filter(v => v !== 'all' && v !== '').length

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
    dispatch(editTransaction({ id, updatedData: editForm, userId, username }))
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
      dispatch(deleteTransaction({ transactionId: deleteDialog.transactionId, userId }))
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

  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('No transactions to export')
      return
    }

    // CSV Headers
    const headers = ['Date', 'Type', 'Description', 'Category', 'Amount (₹)', 'Created By', 'Last Edited By', 'Last Edited At']
    
    // Convert transactions to CSV rows
    const csvRows = [
      headers.join(','),
      ...filteredTransactions.map(transaction => {
        const row = [
          transaction.date,
          transaction.type,
          `"${transaction.description.replace(/"/g, '""')}"`, // Escape quotes in description
          transaction.category || '',
          transaction.amount,
          transaction.createdBy || '',
          transaction.editedBy || '',
          transaction.editedAt || ''
        ]
        return row.join(',')
      })
    ]

    // Create CSV content
    const csvContent = csvRows.join('\n')
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    // Generate filename with month
    const monthName = selectedMonth ? new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'All'
    const filename = `transactions_${monthName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getCategoryIcon = (category) => {
    const icons = {
      Food: '🍔',
      Utilities: '💡',
      Transport: '🚗',
      Fuel: '⛽',
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
        <div className="ledger-header">
          <h2>Transactions Ledger</h2>
          <div className="ledger-header-actions">
            <button 
              className="export-btn"
              onClick={exportToCSV}
              title="Export transactions to CSV"
              disabled={filteredTransactions.length === 0}
            >
              📥 Export CSV
            </button>
            <button 
              className="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
              title="Toggle filters"
            >
              🔍 Filters {activeFiltersCount > 0 && <span className="filter-badge">{activeFiltersCount}</span>}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filters-grid">
              {/* Search */}
              <div className="filter-group">
                <label>Search Description</label>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search transactions..."
                  className="filter-input"
                />
              </div>

              {/* Type Filter */}
              <div className="filter-group">
                <label>Type</label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="filter-group">
                <label>Category</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="all">All Categories</option>
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Creator Filter */}
              <div className="filter-group">
                <label>Created By</label>
                <select
                  name="createdBy"
                  value={filters.createdBy}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="all">All Users</option>
                  {uniqueCreators.map(creator => (
                    <option key={creator} value={creator}>{creator}</option>
                  ))}
                </select>
              </div>

              {/* Min Amount */}
              <div className="filter-group">
                <label>Min Amount (₹)</label>
                <input
                  type="number"
                  name="minAmount"
                  value={filters.minAmount}
                  onChange={handleFilterChange}
                  placeholder="0"
                  step="0.01"
                  min="0"
                  className="filter-input"
                />
              </div>

              {/* Max Amount */}
              <div className="filter-group">
                <label>Max Amount (₹)</label>
                <input
                  type="number"
                  name="maxAmount"
                  value={filters.maxAmount}
                  onChange={handleFilterChange}
                  placeholder="No limit"
                  step="0.01"
                  min="0"
                  className="filter-input"
                />
              </div>
            </div>

            <div className="filters-actions">
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear All Filters
              </button>
              <div className="filter-results-count">
                Showing {filteredTransactions.length} of {transactions.filter(t => t.date.startsWith(selectedMonth)).length} transactions
              </div>
            </div>
          </div>
        )}

        <div className="empty-ledger">
          <p>{activeFiltersCount > 0 ? 'No transactions match the current filters' : 'No transactions for this month'}</p>
          {activeFiltersCount > 0 && (
            <button className="clear-filters-btn" onClick={clearFilters} style={{ marginTop: '12px' }}>
              Clear Filters
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="transactions-ledger">
      <div className="ledger-header">
        <h2>Transactions Ledger</h2>
        <div className="ledger-header-actions">
          <button 
            className="export-btn"
            onClick={exportToCSV}
            title="Export transactions to CSV"
            disabled={filteredTransactions.length === 0}
          >
            📥 Export CSV
          </button>
          <button 
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
            title="Toggle filters"
          >
            🔍 Filters {activeFiltersCount > 0 && <span className="filter-badge">{activeFiltersCount}</span>}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            {/* Search */}
            <div className="filter-group">
              <label>Search Description</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search transactions..."
                className="filter-input"
              />
            </div>

            {/* Type Filter */}
            <div className="filter-group">
              <label>Type</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <label>Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Creator Filter */}
            <div className="filter-group">
              <label>Created By</label>
              <select
                name="createdBy"
                value={filters.createdBy}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="all">All Users</option>
                {uniqueCreators.map(creator => (
                  <option key={creator} value={creator}>{creator}</option>
                ))}
              </select>
            </div>

            {/* Min Amount */}
            <div className="filter-group">
              <label>Min Amount (₹)</label>
              <input
                type="number"
                name="minAmount"
                value={filters.minAmount}
                onChange={handleFilterChange}
                placeholder="0"
                step="0.01"
                min="0"
                className="filter-input"
              />
            </div>

            {/* Max Amount */}
            <div className="filter-group">
              <label>Max Amount (₹)</label>
              <input
                type="number"
                name="maxAmount"
                value={filters.maxAmount}
                onChange={handleFilterChange}
                placeholder="No limit"
                step="0.01"
                min="0"
                className="filter-input"
              />
            </div>
          </div>

          <div className="filters-actions">
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All Filters
            </button>
            <div className="filter-results-count">
              Showing {filteredTransactions.length} of {transactions.filter(t => t.date.startsWith(selectedMonth)).length} transactions
            </div>
          </div>
        </div>
      )}
      
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
                    <div className="transaction-meta-item">
                      <span className="meta-label">Creator:</span>
                      <span className="meta-value creator-badge" style={{ 
                        fontSize: '0.8125rem', 
                        color: '#667eea',
                        fontWeight: '600',
                        background: 'rgba(102, 126, 234, 0.1)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        display: 'inline-block'
                      }}>
                        👤 {transaction.createdBy || 'Unknown'}
                      </span>
                    </div>
                    {transaction.editedBy && transaction.editedAt && (
                      <div className="transaction-meta-item">
                        <span className="meta-label">Last edited:</span>
                        <span className="meta-value" style={{ 
                          fontSize: '0.75rem', 
                          color: '#94a3b8',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}>
                          <span>by {transaction.editedBy}</span>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            {formatDate(transaction.editedAt)}
                          </span>
                        </span>
                      </div>
                    )}
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
                  {transaction.editHistory && transaction.editHistory.length > 0 && (
                    <EditHistory transaction={transaction} />
                  )}
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
              <th>Creator</th>
              <th>Last Edited</th>
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
                      <span style={{ 
                        fontSize: '0.8125rem', 
                        color: '#667eea',
                        fontWeight: '600',
                        background: 'rgba(102, 126, 234, 0.1)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        display: 'inline-block'
                      }}>
                        👤 {transaction.createdBy || 'Unknown'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                      {transaction.editedBy && transaction.editedAt ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span>by {transaction.editedBy}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {formatDate(transaction.editedAt)}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontStyle: 'italic', color: '#64748b' }}>Never</span>
                      )}
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
                      <span style={{ 
                        fontSize: '0.8125rem', 
                        color: '#667eea',
                        fontWeight: '600',
                        background: 'rgba(102, 126, 234, 0.1)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        display: 'inline-block'
                      }}>
                        👤 {transaction.createdBy || 'Unknown'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                      {transaction.editedBy && transaction.editedAt ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span>by {transaction.editedBy}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {formatDate(transaction.editedAt)}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontStyle: 'italic', color: '#64748b' }}>Never</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                        {transaction.editHistory && transaction.editHistory.length > 0 && (
                          <EditHistory transaction={transaction} />
                        )}
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
