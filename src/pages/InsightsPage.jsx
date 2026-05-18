import { useApp } from "../App";
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
  RadialBarChart,
  RadialBar,
} from "recharts";

const fmt = (n) => `KES ${Number(n).toLocaleString()}`;

export default function InsightsPage() {
  const {
    expenses,
    totalIncome,
    totalExpenses,
    savingsRate,
    survivalDays,
    healthScore,
    balance,
    dailyBurnRate,
  } = useApp();

  const [animatedScore, setAnimatedScore] = useState(0);
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");

  // Animate health score
  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const stepTime = duration / steps;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      setAnimatedScore(Math.min(healthScore, healthScore * progress));
      if (step >= steps) {
        setAnimatedScore(healthScore);
        clearInterval(interval);
      }
    }, stepTime);
    return () => clearInterval(interval);
  }, [healthScore]);

  // Generate insights based on data
  const insights = [];
  
  if (savingsRate < 10) {
    insights.push({
      type: "warning",
      title: "Low Savings Rate",
      message: `Your savings rate is ${savingsRate.toFixed(1)}%. Try to save at least 20% of your income.`,
      action: "Increase savings by cutting non-essentials",
      icon: "⚠️",
    });
  } else if (savingsRate > 20) {
    insights.push({
      type: "success",
      title: "Excellent Savings!",
      message: `You're saving ${savingsRate.toFixed(1)}% of your income. Keep up the great work!`,
      action: "Consider investing your surplus",
      icon: "🎉",
    });
  }

  if (survivalDays < 15) {
    insights.push({
      type: "critical",
      title: "Low Survival Days",
      message: `Your money will only last ${survivalDays} days. Reduce expenses immediately.`,
      action: "Review your spending categories",
      icon: "🚨",
    });
  } else if (survivalDays > 30) {
    insights.push({
      type: "success",
      title: "Strong Financial Cushion",
      message: `Your money lasts ${survivalDays} days. You have good financial stability.`,
      action: "Start investing for long-term growth",
      icon: "💪",
    });
  }

  if (totalExpenses > totalIncome) {
    insights.push({
      type: "critical",
      title: "Spending Exceeds Income",
      message: `You're spending ${fmt(totalExpenses - totalIncome)} more than you earn.`,
      action: "Create a budget to reduce expenses",
      icon: "📉",
    });
  }

  if (balance < 0) {
    insights.push({
      type: "critical",
      title: "Negative Balance",
      message: "Your balance is negative. Take immediate action.",
      action: "Review all expenses and cut non-essentials",
      icon: "🔴",
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: "success",
      title: "You're on Track!",
      message: "Your finances look healthy. Keep monitoring to stay on top.",
      action: "Set new financial goals",
      icon: "🌟",
    });
  }

  const spendingTrend = [
    { day: "Mon", amount: 1200 },
    { day: "Tue", amount: 800 },
    { day: "Wed", amount: 1500 },
    { day: "Thu", amount: 600 },
    { day: "Fri", amount: 2000 },
    { day: "Sat", amount: 2500 },
    { day: "Sun", amount: 900 },
  ];

  const weeklyData = [
    { name: "Week 1", spending: 8500, income: 20000 },
    { name: "Week 2", spending: 9200, income: 20000 },
    { name: "Week 3", spending: 7800, income: 20000 },
    { name: "Week 4", spending: totalExpenses, income: totalIncome },
  ];

  const healthColor = healthScore >= 70 ? "#10b981" : healthScore >= 45 ? "#f59e0b" : "#ef4444";
  const healthLabel = healthScore >= 70 ? "Excellent" : healthScore >= 45 ? "Fair" : "Poor";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-400 rounded-full mb-4">
            <span>🧠</span> AI Financial Insights
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-3">
            Smart Insights
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Personalized recommendations to improve your financial health
          </p>
        </div>

        {/* Health Score Gauge */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-lg mb-6">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Health Score</h2>
            <p className="text-xs text-gray-500">Based on spending, savings, and income patterns</p>
          </div>
          <div className="relative h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="60%" 
                outerRadius="100%" 
                data={[{ name: 'Health', value: animatedScore, fill: healthColor }]} 
                startAngle={180} 
                endAngle={0}
              >
                <RadialBar background clockWise dataKey="value" cornerRadius={10} />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-current" fill={healthColor}>
                  {Math.round(animatedScore)}
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-4">
            <div className={`text-lg font-bold`} style={{ color: healthColor }}>
              {healthLabel} Health
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {healthScore >= 70 
                ? "You're doing great! Keep maintaining these habits." 
                : healthScore >= 45 
                ? "Room for improvement - small changes will help." 
                : "Needs immediate attention - review your finances."}
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <MetricCard 
            label="Savings Rate" 
            value={savingsRate.toFixed(1)} 
            unit="%"
            icon="💰"
            trend={savingsRate > 15 ? "up" : "down"}
            color="emerald"
          />
          <MetricCard 
            label="Survival Days" 
            value={survivalDays} 
            unit="days"
            icon="⏰"
            trend={survivalDays > 30 ? "up" : "down"}
            color="blue"
          />
          <MetricCard 
            label="Monthly Income" 
            value={fmt(totalIncome)} 
            icon="📈"
            trend="neutral"
            color="green"
          />
          <MetricCard 
            label="Monthly Expenses" 
            value={fmt(totalExpenses)} 
            icon="📉"
            trend={totalExpenses > totalIncome ? "down" : "neutral"}
            color="rose"
          />
        </div>

        {/* Spending Trend Chart */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Spending Trends</h3>
            <div className="flex gap-2">
              {['week', 'month'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedTimeframe === tf
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {tf === 'week' ? 'This Week' : 'This Month'}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={selectedTimeframe === 'week' ? spendingTrend : weeklyData}>
                <XAxis dataKey={selectedTimeframe === 'week' ? 'day' : 'name'} stroke="#9ca3af" fontSize={12} />
                <YAxis hide />
                <Tooltip 
                  formatter={(value) => fmt(value)}
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey={selectedTimeframe === 'week' ? 'amount' : 'spending'} 
                  stroke="#8b5cf6" 
                  fill="#8b5cf620" 
                  strokeWidth={2.5} 
                />
                {selectedTimeframe === 'month' && (
                  <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Feed */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personalized Insights</h2>
          </div>
          
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-xl border-l-4 transition-all duration-300 hover:scale-[1.02] cursor-pointer animate-slide-in`}
              style={{
                backgroundColor: insight.type === 'critical' ? '#fef2f2' : insight.type === 'warning' ? '#fffbeb' : '#f0fdf4',
                borderLeftColor: insight.type === 'critical' ? '#ef4444' : insight.type === 'warning' ? '#f59e0b' : '#10b981',
                animationDelay: `${idx * 0.1}s`
              }}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{insight.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{insight.title}</h3>
                  <p className="text-sm text-gray-700 mb-2">{insight.message}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">💡 Suggested action:</span>
                    <span className="text-xs font-semibold text-gray-800">{insight.action}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Spending Analysis */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-800/30 mb-6">
          <div className="flex gap-3 mb-4">
            <div className="text-3xl">📊</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Spending Analysis</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Monthly breakdown</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Essential Expenses</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {totalExpenses > 0 ? Math.round((totalExpenses * 0.7) / totalExpenses * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="h-2 rounded-full bg-purple-500" style={{ width: `${totalExpenses > 0 ? (totalExpenses * 0.7) / totalExpenses * 100 : 0}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Discretionary Spending</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {totalExpenses > 0 ? Math.round((totalExpenses * 0.3) / totalExpenses * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="h-2 rounded-full bg-pink-500" style={{ width: `${totalExpenses > 0 ? (totalExpenses * 0.3) / totalExpenses * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              💡 {totalExpenses > totalIncome * 0.7 
                ? "Your essential expenses are high. Consider negotiating bills or finding cheaper alternatives." 
                : "Your spending ratio looks balanced. Focus on growing your income to accelerate wealth building."}
            </p>
          </div>
        </div>

        {/* Action Plan Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🎯</span>
            <h3 className="font-bold">Your 30-Day Action Plan</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Track all expenses daily</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Set up automatic savings transfer</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Review subscriptions and cancel unused ones</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Cook at home 5 days a week</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Use the "Can I Afford This?" tool before big purchases</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

/* Metric Card Component */
function MetricCard({ label, value, unit, icon, trend, color }) {
  const colors = {
    emerald: "from-emerald-500 to-teal-500",
    blue: "from-blue-500 to-indigo-500",
    green: "from-green-500 to-emerald-500",
    rose: "from-rose-500 to-pink-500",
  };
  
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  const trendColor = trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-gray-500";
  
  return (
    <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-800/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {trend !== "neutral" && <span className={`text-xs font-semibold ${trendColor}`}>{trendIcon}</span>}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{label}</div>
      <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
        {value}{unit && <span className="text-sm ml-0.5 text-gray-500">{unit}</span>}
      </div>
    </div>
  );
}
