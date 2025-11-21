import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setSelectedMonth } from '../../store/slices/transactionsSlice'
import Analytics from '../Analytics/Analytics'
import './Dashboard.css'

// Detect if device is mobile
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.matchMedia && window.matchMedia('(max-width: 768px)').matches && 'ontouchstart' in window)
}

function Dashboard() {
  const dispatch = useDispatch()
  const transactions = useSelector((state) => state.transactions.transactions)
  const selectedMonth = useSelector((state) => state.transactions.selectedMonth)
  const [isMobile, setIsMobile] = useState(isMobileDevice())

  const [monthlyStats, setMonthlyStats] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    transactionCount: 0
  })

  const [categoryBreakdown, setCategoryBreakdown] = useState({})
  const [chartData, setChartData] = useState([])
  const [dailyExpenses, setDailyExpenses] = useState([])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileDevice())
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const filtered = transactions.filter(t => t.date.startsWith(selectedMonth))
    
    const income = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
    
    const expenses = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)

    // Calculate balance for current month
    const currentMonthBalance = income - expenses

    // Calculate cumulative balance from all previous months (carry forward)
    const previousMonthsBalance = transactions
      .filter(t => {
        // Get all transactions before the selected month
        const transactionDate = t.date.substring(0, 7) // Get YYYY-MM format
        return transactionDate < selectedMonth
      })
      .reduce((sum, t) => {
        const amount = parseFloat(t.amount || 0)
        return sum + (t.type === 'income' ? amount : -amount)
      }, 0)

    // Total balance = previous months balance + current month balance
    const balance = previousMonthsBalance + currentMonthBalance

    // Category breakdown for expenses
    const breakdown = {}
    filtered
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = t.category || 'Other'
        breakdown[cat] = (breakdown[cat] || 0) + parseFloat(t.amount || 0)
      })

    // Prepare chart data for pie chart
    const chartDataArray = Object.entries(breakdown).map(([name, value]) => ({
      name,
      value: parseFloat(value)
    })).sort((a, b) => b.value - a.value)

    // Daily expenses data
    const dailyData = {}
    filtered
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const day = t.date.split('-')[2]
        dailyData[day] = (dailyData[day] || 0) + parseFloat(t.amount || 0)
      })
    
    const dailyArray = Object.entries(dailyData)
      .map(([day, amount]) => ({
        day: parseInt(day),
        amount: parseFloat(amount)
      }))
      .sort((a, b) => a.day - b.day)

    setMonthlyStats({
      income,
      expenses,
      balance,
      transactionCount: filtered.length
    })
    setCategoryBreakdown(breakdown)
    setChartData(chartDataArray)
    setDailyExpenses(dailyArray)
  }, [transactions, selectedMonth])

  const formatMonth = (monthString) => {
    const date = new Date(monthString + '-01')
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const handleMonthChange = (month) => {
    dispatch(setSelectedMonth(month))
  }

  // Colors for charts
  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0', '#a8edea', '#fed6e3']

  const getMaxDailyAmount = () => {
    if (dailyExpenses.length === 0) return 1
    return Math.max(...dailyExpenses.map(d => d.amount))
  }


  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Dashboard</h2>
        <div className="month-selector-dashboard">
          <label htmlFor="dashboard-month">Month:</label>
          <input
            type="month"
            id="dashboard-month"
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="month-input-dashboard"
          />
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card income-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Income</h3>
            <p className="stat-amount income">{formatCurrency(monthlyStats.income)}</p>
          </div>
        </div>

        <div className="stat-card expense-card">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <h3>Total Expenses</h3>
            <p className="stat-amount expense">{formatCurrency(monthlyStats.expenses)}</p>
          </div>
        </div>

        <div className={`stat-card balance-card ${monthlyStats.balance >= 0 ? 'positive' : 'negative'}`}>
          <div className="stat-icon">{monthlyStats.balance >= 0 ? '✅' : '⚠️'}</div>
          <div className="stat-content">
            <h3>Balance (Cumulative)</h3>
            <p className="stat-amount balance">{formatCurrency(monthlyStats.balance)}</p>
          </div>
        </div>

        <div className="stat-card count-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>Transactions</h3>
            <p className="stat-amount count">{monthlyStats.transactionCount}</p>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <Analytics
        chartData={chartData}
        dailyExpenses={dailyExpenses}
        monthlyStats={monthlyStats}
        colors={COLORS}
        transactions={transactions}
        selectedMonth={selectedMonth}
      />
    </div>
  )
}

export default Dashboard
