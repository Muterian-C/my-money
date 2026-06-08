import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,  // ← Add this import
} from "recharts";

const fmt = (n) => `KES ${Number(n).toLocaleString()}`;

export default function ProgressiveTrendChart({ expenses, totalIncome }) {
  const [timeframe, setTimeframe] = useState("weekly");
  const [availableTimeframes, setAvailableTimeframes] = useState({
    daily: false,
    weekly: false,
    monthly: false,
  });
  const [chartData, setChartData] = useState([]);
  const [chartType, setChartType] = useState("spending");

  // Analyze data to determine available timeframes
  useEffect(() => {
    if (!expenses || expenses.length === 0) {
      setAvailableTimeframes({ daily: false, weekly: false, monthly: false });
      setTimeframe("weekly");
      return;
    }

    // Get date range
    const dates = expenses.map(e => new Date(e.date));
    const oldestDate = new Date(Math.min(...dates));
    const newestDate = new Date(Math.max(...dates));
    const daysDifference = Math.ceil((newestDate - oldestDate) / (1000 * 60 * 60 * 24));
    const weeksDifference = Math.ceil(daysDifference / 7);
    const monthsDifference = (newestDate.getFullYear() - oldestDate.getFullYear()) * 12 + 
                             (newestDate.getMonth() - oldestDate.getMonth());

    const newAvailable = {
      daily: daysDifference >= 7,
      weekly: weeksDifference >= 2,
      monthly: monthsDifference >= 2,
    };
    
    setAvailableTimeframes(newAvailable);
    
    // Auto-select best timeframe based on data age
    if (monthsDifference >= 2 && newAvailable.monthly) {
      setTimeframe("monthly");
    } else if (weeksDifference >= 2 && newAvailable.weekly) {
      setTimeframe("weekly");
    } else if (daysDifference >= 7 && newAvailable.daily) {
      setTimeframe("daily");
    } else {
      setTimeframe("weekly");
    }
  }, [expenses]);

  // Generate chart data based on selected timeframe
  useEffect(() => {
    if (!expenses || expenses.length === 0) {
      setChartData([]);
      return;
    }

    let data = [];
    const now = new Date();

    switch (timeframe) {
      case "daily":
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          
          const dayExpenses = expenses
            .filter(exp => {
              const expDate = new Date(exp.date);
              return expDate.toDateString() === date.toDateString();
            })
            .reduce((sum, exp) => sum + exp.amount, 0);
          
          data.push({
            name: dayName,
            expenses: dayExpenses,
            income: totalIncome / 30,
            savings: (totalIncome / 30) - dayExpenses,
            fullDate: date,
          });
        }
        break;

      case "weekly":
        const weeksToShow = Math.min(8, Math.ceil(expenses.length / 3) + 2);
        for (let i = weeksToShow - 1; i >= 0; i--) {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - (i * 7));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          const weekExpenses = expenses
            .filter(exp => {
              const expDate = new Date(exp.date);
              return expDate >= weekStart && expDate <= weekEnd;
            })
            .reduce((sum, exp) => sum + exp.amount, 0);
          
          data.push({
            name: `Wk ${weeksToShow - i}`,
            expenses: weekExpenses,
            income: totalIncome / 4,
            savings: (totalIncome / 4) - weekExpenses,
            startDate: weekStart,
          });
        }
        break;

      case "monthly":
        const monthsToShow = 6;
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        for (let i = monthsToShow - 1; i >= 0; i--) {
          const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const month = targetDate.getMonth();
          const year = targetDate.getFullYear();
          
          const monthExpenses = expenses
            .filter(exp => {
              const expDate = new Date(exp.date);
              return expDate.getMonth() === month && expDate.getFullYear() === year;
            })
            .reduce((sum, exp) => sum + exp.amount, 0);
          
          data.push({
            name: `${monthNames[month]} ${year !== now.getFullYear() ? `'${year.toString().slice(-2)}` : ''}`,
            expenses: monthExpenses,
            income: totalIncome,
            savings: totalIncome - monthExpenses,
            month: month + 1,
            year: year,
          });
        }
        break;
    }
    
    setChartData(data);
  }, [timeframe, expenses, totalIncome]);

  const getAvailableTimeframeOptions = () => {
    const options = [];
    if (availableTimeframes.daily) options.push({ id: "daily", label: "Daily", icon: "📆" });
    if (availableTimeframes.weekly) options.push({ id: "weekly", label: "Weekly", icon: "📊" });
    if (availableTimeframes.monthly) options.push({ id: "monthly", label: "Monthly", icon: "📅" });
    return options;
  };

  const getTimeframeMessage = () => {
    if (expenses.length === 0) {
      return "📝 Add your first expense to start seeing trends!";
    }
    if (!availableTimeframes.weekly && !availableTimeframes.monthly) {
      return "📈 Track for 2 more weeks to unlock weekly trends!";
    }
    if (!availableTimeframes.monthly && availableTimeframes.weekly) {
      return "🎯 Track for 2 more months to unlock monthly trends!";
    }
    return null;
  };

  const options = getAvailableTimeframeOptions();
  const message = getTimeframeMessage();

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 rounded-xl">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
          {expenses.length === 0 
            ? "No expense data yet. Start tracking to see your financial trends!"
            : "Not enough data to show trends. Keep tracking!"}
        </p>
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => window.location.href = '/expenses'}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold"
          >
            Add Expense →
          </button>
          <button
            onClick={() => window.location.href = '/income'}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold"
          >
            Add Income →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeframe Selector */}
      {options.length > 1 && (
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex gap-2">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTimeframe(opt.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                  timeframe === opt.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                <span>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setChartType("spending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                chartType === "spending"
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              Income vs Expenses
            </button>
            <button
              onClick={() => setChartType("savings")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                chartType === "savings"
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              Savings Growth
            </button>
          </div>
        </div>
      )}

      {/* Progressive unlock message */}
      {message && options.length <= 1 && (
        <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌟</span>
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">Progressive Insights</p>
              <p className="text-xs text-amber-700 dark:text-amber-500">{message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} />
            <YAxis hide />
            <Tooltip 
              formatter={(value, name) => [fmt(value), name === 'expenses' ? 'Expenses' : name === 'income' ? 'Income' : 'Savings']}
              contentStyle={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '10px 14px',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            {chartType === 'spending' ? (
              <>
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  fill="#10b98120" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#ef4444" 
                  strokeWidth={2.5} 
                  fill="#ef444420" 
                />
              </>
            ) : (
              <Line 
                type="monotone" 
                dataKey="savings" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ fill: "#3b82f6", r: 4, strokeWidth: 2 }} 
                activeDot={{ r: 6 }} 
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Info badge */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400">
          <span>📈</span>
          {timeframe === 'daily' && 'Showing daily trends (last 7 days)'}
          {timeframe === 'weekly' && 'Showing weekly trends'}
          {timeframe === 'monthly' && 'Showing monthly trends'}
        </span>
      </div>
    </div>
  );
}
