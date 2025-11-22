import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'
import './Analytics.css'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const Analytics = ({ chartData = [], dailyExpenses = [], monthlyStats = {}, colors = [], transactions = [], selectedMonth = '' }) => {
  const total = chartData.reduce((s, c) => s + (c.value || 0), 0) || 1

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0)
  }

  // Prepare chart data with all days of the month
  const chartDataForBar = useMemo(() => {
    if (!selectedMonth) return { labels: [], datasets: [] }

    try {
      const [year, month] = selectedMonth.split('-').map(Number)
      const daysInMonth = new Date(year, month, 0).getDate()
      
      // Create a map of existing expenses by day
      const expensesMap = new Map()
      dailyExpenses.forEach(d => {
        expensesMap.set(d.day, d.amount)
      })
      
      // Create labels for all days
      const labels = []
      const amounts = []
      
      for (let day = 1; day <= daysInMonth; day++) {
        labels.push(day)
        const amount = expensesMap.get(day) || 0
        amounts.push(amount)
      }

      // Create canvas for gradients
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      return {
        labels,
        datasets: [
          {
            label: 'Daily Expenses',
            data: amounts,
            backgroundColor: (context) => {
              const chart = context.chart
              const {ctx, chartArea} = chart
              
              if (!chartArea) {
                return 'rgba(148, 163, 184, 0.1)'
              }

              const index = context.dataIndex
              const amount = amounts[index]
              
              if (amount === 0) {
                return 'rgba(148, 163, 184, 0.1)'
              }

              const colorIndex = index % colors.length
              const nextColorIndex = (index + 1) % colors.length
              
              const gradient = ctx.createLinearGradient(
                0,
                chartArea.bottom,
                0,
                chartArea.top
              )
              
              gradient.addColorStop(0, colors[nextColorIndex])
              gradient.addColorStop(1, colors[colorIndex])
              
              return gradient
            },
            borderRadius: 6,
            borderSkipped: false,
            borderWidth: 0,
            barThickness: 'flex',
            maxBarThickness: 50,
          }
        ]
      }
    } catch (e) {
      return { labels: [], datasets: [] }
    }
  }, [dailyExpenses, selectedMonth, colors])

  // Chart options
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#cbd5e1',
        bodyColor: '#f1f5f9',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        titleFont: {
          size: 12,
          weight: 600
        },
        bodyFont: {
          size: 14,
          weight: 700
        },
        callbacks: {
          title: (context) => `Day ${context[0].label}`,
          label: (context) => formatCurrency(context.parsed.y)
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
            weight: 600
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
          callback: function(value, index, ticks) {
            // Show only every nth day based on total days
            const totalDays = ticks.length
            const step = Math.ceil(totalDays / 10)
            if (index % step === 0 || index === ticks.length - 1) {
              return this.getLabelForValue(value)
            }
            return ''
          }
        },
        border: {
          color: '#94a3b8',
          width: 2
        }
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.25)',
          lineWidth: 1,
          borderDash: [3, 3],
          drawBorder: false
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
            weight: 600
          },
          callback: function(value) {
            if (value === 0) return '₹0'
            if (value >= 1000) {
              return `₹${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`
            }
            return `₹${Math.round(value)}`
          }
        },
        border: {
          color: '#94a3b8',
          width: 2
        },
        beginAtZero: true
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    onHover: (event, activeElements) => {
      event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default'
    },
    elements: {
      bar: {
        borderWidth: 0,
        borderSkipped: false
      }
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart'
    }
  }), [formatCurrency])

  return (
    <div className="analytics">
      {/* Category Breakdown with Pie Chart */}
      {chartData.length > 0 && (
        <div className="analytics-section">
          <h4>Top Spending Category</h4>
          <div className="category-chart-container">
            {/* Pie Chart */}
            <div className="pie-chart-container">
              <Pie 
                data={{
                  labels: chartData.map(c => c.name),
                  datasets: [{
                    data: chartData.map(c => c.value),
                    backgroundColor: chartData.map((c, i) => colors[i % colors.length]),
                    borderWidth: 0,
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#f1f5f9'
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: '#1e293b',
                      titleColor: '#cbd5e1',
                      bodyColor: '#f1f5f9',
                      borderColor: '#334155',
                      borderWidth: 1,
                      padding: 12,
                      cornerRadius: 8,
                      displayColors: true,
                      titleFont: {
                        size: 12,
                        weight: 600
                      },
                      bodyFont: {
                        size: 14,
                        weight: 700
                      },
                      callbacks: {
                        label: (context) => {
                          const label = context.label || ''
                          const value = context.parsed || 0
                          const percent = Math.round((value / total) * 100)
                          return `${label}: ${formatCurrency(value)} (${percent}%)`
                        }
                      }
                    }
                  },
                  interaction: {
                    intersect: false
                  }
                }}
              />
            </div>

            {/* Category List - Shows all items, scrollable if more than 5 */}
            <div className="category-breakdown-list-wrapper">
              <div className="category-breakdown-list">
                {chartData.map((c, i) => {
                  const percent = Math.round((c.value / total) * 100)
                  return (
                    <div key={c.name} className="category-breakdown-item">
                      <div className="category-breakdown-header">
                        <div className="category-breakdown-name">
                          <span className="category-color-swatch" style={{ background: colors[i % colors.length] }}></span>
                          <span>{c.name}</span>
                        </div>
                        <div className="category-breakdown-amount">
                          <span className="amount-value">{formatCurrency(c.value)}</span>
                          <span className="amount-percent">{percent}%</span>
                        </div>
                      </div>
                      <div className="category-breakdown-bar">
                        <div 
                          className="category-breakdown-bar-fill" 
                          style={{ 
                            width: `${percent}%`,
                            background: colors[i % colors.length]
                          }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Expenses Chart using Chart.js */}
      {chartDataForBar.labels.length > 0 && (
        <div className="analytics-section">
          <h4>Daily Expenses Trend</h4>
          <div className="chartjs-container">
            <div className="chartjs-wrapper">
              <Bar data={chartDataForBar} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      {!selectedMonth && chartData.length === 0 && dailyExpenses.length === 0 && (
        <div className="analytics-empty">
          <p>No expense data available for this month</p>
          <p className="analytics-empty-hint">Add expenses to see analytics</p>
        </div>
      )}
    </div>
  )
}

export default Analytics
