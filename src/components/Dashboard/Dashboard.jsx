import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setSelectedMonth } from '../../store/slices/transactionsSlice'
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
  const [isPieChartCollapsed, setIsPieChartCollapsed] = useState(true)
  const [isBarChartCollapsed, setIsBarChartCollapsed] = useState(true)

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

    const balance = income - expenses

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

  const getTopCategories = () => {
    return Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
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

  const maxDaily = getMaxDailyAmount()

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
            <h3>Balance</h3>
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

      {monthlyStats.expenses > 0 && (
        <>
          <div className={`charts-section ${isMobile ? 'charts-mobile' : 'charts-desktop'}`}>
            {chartData.length > 0 && (
              <div className="chart-container collapsible-chart">
                {isMobile ? (
                  <>
                    <h3 
                      className="chart-title-collapsible"
                      onClick={() => setIsPieChartCollapsed(!isPieChartCollapsed)}
                    >
                      <span>Expense by Category</span>
                      <span className="collapse-icon">{isPieChartCollapsed ? '▼' : '▲'}</span>
                    </h3>
                    {!isPieChartCollapsed && (
                      <div className="pie-chart">
                        <svg viewBox="0 0 200 200" className="pie-svg">
                          {(() => {
                            let currentAngle = -90
                            const total = chartData.reduce((sum, item) => sum + item.value, 0)
                            
                            return chartData.map((item, index) => {
                              const percentage = (item.value / total) * 100
                              const angle = (percentage / 100) * 360
                              const startAngle = currentAngle
                              const endAngle = currentAngle + angle
                              
                              const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180)
                              const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180)
                              const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180)
                              const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180)
                              const largeArc = angle > 180 ? 1 : 0
                              
                              const pathData = [
                                `M 100 100`,
                                `L ${x1} ${y1}`,
                                `A 80 80 0 ${largeArc} 1 ${x2} ${y2}`,
                                `Z`
                              ].join(' ')
                              
                              currentAngle += angle
                              
                              return (
                                <path
                                  key={item.name}
                                  d={pathData}
                                  fill={COLORS[index % COLORS.length]}
                                  stroke="#0f172a"
                                  strokeWidth="2"
                                />
                              )
                            })
                          })()}
                        </svg>
                        <div className="pie-legend">
                          {chartData.map((item, index) => {
                            const percentage = ((item.value / chartData.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(1)
                            return (
                              <div key={item.name} className="legend-item">
                                <span className="legend-color" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                <span className="legend-label">{item.name}</span>
                                <span className="legend-value">{formatCurrency(item.value)} ({percentage}%)</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h3>Expense by Category</h3>
                    <div className="pie-chart">
                      <svg viewBox="0 0 200 200" className="pie-svg">
                        {(() => {
                          let currentAngle = -90
                          const total = chartData.reduce((sum, item) => sum + item.value, 0)
                          
                          return chartData.map((item, index) => {
                            const percentage = (item.value / total) * 100
                            const angle = (percentage / 100) * 360
                            const startAngle = currentAngle
                            const endAngle = currentAngle + angle
                            
                            const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180)
                            const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180)
                            const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180)
                            const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180)
                            const largeArc = angle > 180 ? 1 : 0
                            
                            const pathData = [
                              `M 100 100`,
                              `L ${x1} ${y1}`,
                              `A 80 80 0 ${largeArc} 1 ${x2} ${y2}`,
                              `Z`
                            ].join(' ')
                            
                            currentAngle += angle
                            
                            return (
                              <path
                                key={item.name}
                                d={pathData}
                                fill={COLORS[index % COLORS.length]}
                                stroke="#0f172a"
                                strokeWidth="2"
                              />
                            )
                          })
                        })()}
                      </svg>
                      <div className="pie-legend">
                        {chartData.map((item, index) => {
                          const percentage = ((item.value / chartData.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(1)
                          return (
                            <div key={item.name} className="legend-item">
                              <span className="legend-color" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                              <span className="legend-label">{item.name}</span>
                              <span className="legend-value">{formatCurrency(item.value)} ({percentage}%)</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {dailyExpenses.length > 0 && (
              <div className="chart-container bar-chart-container collapsible-chart">
                {isMobile ? (
                  <>
                    <h3 
                      className="chart-title-collapsible"
                      onClick={() => setIsBarChartCollapsed(!isBarChartCollapsed)}
                    >
                      <span>Daily Expenses - {formatMonth(selectedMonth)}</span>
                      <span className="collapse-icon">{isBarChartCollapsed ? '▼' : '▲'}</span>
                    </h3>
                    {!isBarChartCollapsed && (
                      <>
                        <div className="bar-chart">
                          <div className="bar-chart-bars">
                            {dailyExpenses.map((item, index) => {
                              const height = maxDaily > 0 ? (item.amount / maxDaily) * 100 : 0
                              return (
                                <div key={index} className="bar-chart-item">
                                  <div className="bar-wrapper">
                                    <div 
                                      className="bar" 
                                      style={{ 
                                        height: `${height}%`,
                                        backgroundColor: COLORS[0]
                                      }}
                                      title={formatCurrency(item.amount)}
                                    >
                                      <span className="bar-value">{formatCurrency(item.amount)}</span>
                                    </div>
                                  </div>
                                  <span className="bar-label">Day {item.day}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        <div className="category-breakdown-inline">
                          <h4>Top Expense Categories</h4>
                          <div className="category-list-scrollable">
                            {getTopCategories().map(([category, amount]) => {
                              const percentage = ((amount / monthlyStats.expenses) * 100).toFixed(1)
                              return (
                                <div key={category} className="category-item">
                                  <div className="category-header">
                                    <span className="category-name">{category}</span>
                                    <div className="category-amount-group">
                                      <span className="category-amount">{formatCurrency(amount)}</span>
                                      <span className="category-percentage">{percentage}%</span>
                                    </div>
                                  </div>
                                  <div className="category-bar">
                                    <div 
                                      className="category-bar-fill" 
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <h3>Daily Expenses - {formatMonth(selectedMonth)}</h3>
                    <div className="bar-chart">
                      <div className="bar-chart-bars">
                        {dailyExpenses.map((item, index) => {
                          const height = maxDaily > 0 ? (item.amount / maxDaily) * 100 : 0
                          return (
                            <div key={index} className="bar-chart-item">
                              <div className="bar-wrapper">
                                <div 
                                  className="bar" 
                                  style={{ 
                                    height: `${height}%`,
                                    backgroundColor: COLORS[0]
                                  }}
                                  title={formatCurrency(item.amount)}
                                >
                                  <span className="bar-value">{formatCurrency(item.amount)}</span>
                                </div>
                              </div>
                              <span className="bar-label">Day {item.day}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="category-breakdown-inline">
                      <h4>Top Expense Categories</h4>
                      <div className="category-list-scrollable">
                        {getTopCategories().map(([category, amount]) => {
                          const percentage = ((amount / monthlyStats.expenses) * 100).toFixed(1)
                          return (
                            <div key={category} className="category-item">
                              <div className="category-header">
                                <span className="category-name">{category}</span>
                                <div className="category-amount-group">
                                  <span className="category-amount">{formatCurrency(amount)}</span>
                                  <span className="category-percentage">{percentage}%</span>
                                </div>
                              </div>
                              <div className="category-bar">
                                <div 
                                  className="category-bar-fill" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {monthlyStats.transactionCount === 0 && (
        <div className="empty-dashboard">
          <p>No transactions for {formatMonth(selectedMonth)}</p>
          <p className="hint">Add income or expenses to see analytics</p>
        </div>
      )}
    </div>
  )
}

export default Dashboard
