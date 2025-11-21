import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addTransaction } from '../../store/slices/transactionsSlice'
import './ExpenseForm.css'

function ExpenseForm() {
  const dispatch = useDispatch()
  const selectedMonth = useSelector((state) => state.transactions.selectedMonth)
  
  const getCurrentDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: 'Food',
    date: getCurrentDate()
  })

  // Compute the date value - always use today if form is empty
  const isFormEmpty = !formData.amount && !formData.description
  const today = getCurrentDate()
  // If form is empty, always show today's date; otherwise use the selected date
  const displayDate = isFormEmpty ? today : (formData.date || today)

  // Update date in state to today whenever form becomes empty
  useEffect(() => {
    if (isFormEmpty) {
      const currentToday = getCurrentDate()
      setFormData(prev => ({
        ...prev,
        date: currentToday
      }))
    }
  }, [isFormEmpty])

  const expenseCategories = ['Bills', 'Entertainment', 'Food', 'Fuel', 'Gift', 'Healthcare', 'Loan', 'Other', 'Shopping', 'Transport', 'Utilities']
  const incomeCategories = ['Gift', 'Investment', 'Other', 'Salary']
  
  const categories = formData.type === 'income' ? incomeCategories : expenseCategories

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.amount || !formData.description) {
      alert('Please fill in all required fields')
      return
    }

    // Use the display date (which is always current if form was empty)
    const transactionDate = displayDate || getCurrentDate()
    
    dispatch(addTransaction({
      ...formData,
      amount: parseFloat(formData.amount).toFixed(2),
      date: transactionDate
    }))

    // Reset form
    setFormData({
      type: 'expense',
      amount: '',
      description: '',
      category: 'Food',
      date: getCurrentDate()
    })
  }

  const handleChange = (e) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value
    }
    
    // Reset category when type changes
    if (e.target.name === 'type') {
      newFormData.category = e.target.value === 'income' ? 'Salary' : 'Food'
    }
    
    setFormData(newFormData)
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h2>Add New Transaction</h2>
      
      <div className="form-group">
        <label htmlFor="type">Type *</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="type-select"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="amount">Amount (₹) *</label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          step="0.01"
          min="0"
          placeholder="0.00"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="e.g., Groceries, Electricity bill"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={displayDate}
            onChange={handleChange}
            max={getCurrentDate()}
          />
        </div>
      </div>

      <button type="submit" className={`submit-btn ${formData.type === 'income' ? 'income-btn' : 'expense-btn'}`}>
        Add {formData.type === 'income' ? 'Income' : 'Expense'}
      </button>
    </form>
  )
}

export default ExpenseForm
