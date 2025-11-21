import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addTransaction } from '../../store/slices/transactionsSlice'
import './ExpenseForm.css'

function ExpenseForm() {
  const dispatch = useDispatch()
  const selectedMonth = useSelector((state) => state.transactions.selectedMonth)
  
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: 'Food',
    date: new Date().toISOString().slice(0, 10)
  })

  const expenseCategories = ['Food', 'Utilities', 'Transport', 'Fuel', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Other']
  const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']
  
  const categories = formData.type === 'income' ? incomeCategories : expenseCategories

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.amount || !formData.description) {
      alert('Please fill in all required fields')
      return
    }

    // Use selected month's date if no date is selected
    const transactionDate = formData.date || `${selectedMonth}-01`
    
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
      date: new Date().toISOString().slice(0, 10)
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
            value={formData.date}
            onChange={handleChange}
            max={new Date().toISOString().slice(0, 10)}
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
