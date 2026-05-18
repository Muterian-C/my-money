import { useApp } from "../App";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  Legend,
  Line,
} from "recharts";

const fmt = (n) => `KES ${n.toLocaleString()}`;

const CATEGORY_COLORS = {
  rent: "#6366f1",
  transport: "#f59e0b",
  food: "#10b981",
  internet: "#3b82f6",
  helb: "#ef4444",
  blacktax: "#8b5cf6",
  savings: "#14b8a6",
  utilities: "#f97316",
  emergencies: "#ec4899",
};

const CATEGORY_LABELS = {
  rent: "Rent",
  transport: "Transport",
  food: "Food",
  internet: "Internet",
  helb: "HELB",
  blacktax: "Black Tax",
  savings: "Savings",
  utilities: "Utilities",
  emergencies: "Emergency",
};

export default function Dashboard() {
  const { user } = useAuth();
  const {
    expenses,
    totalIncome,
    totalExpenses,
    balance,
    savingsRate,
    daysToPayday,
    survivalDays,
    healthScore,
    dailyBurnRate,
  } = useApp();

  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState("spending");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 600);
  }, []);

  const [animatedValues, setAnimatedValues] = useState({
    balance: 0,
    totalIncome: 0,
    totalExpenses: 0,
  });

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const stepTime = duration / steps;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      setAnimatedValues({
        balance: Math.min(balance, balance * progress),
        totalIncome: Math.min(totalIncome, totalIncome * progress),
        totalExpenses: Math.min(totalExpenses, totalExpenses * progress),
      });
      if (step >= steps) {
        setAnimatedValues({ balance, totalIncome, totalExpenses });
        clearInterval(interval);
      }
    }, stepTime);
    return () => clearInterval(interval);
  }, [balance, totalIncome, totalExpenses]);

  const expenseByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const pieData = Object.entries(expenseByCategory).map(([k, v]) => ({
    name: CATEGORY_LABELS[k] || k,
    value: v,
    color: CATEGORY_COLORS[k] || "#888",
  }));

  const spendingRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  const healthColor = healthScore >= 70 ? "text-emerald-600" : healthScore >= 45 ? "text-amber-600" : "text-rose-600";
  const healthLabel = healthScore >= 70 ? "Excellent" : healthScore >= 45 ? "Needs Attention" : "Critical";
  const healthIcon = healthScore >= 70 ? "🎉" : healthScore >= 45 ? "⚠️" : "🔴";

  const alerts = [];
  if (survivalDays < 10) alerts.push({ type: "danger", msg: `You may run out of money in ${survivalDays} days.`, action: "Reduce expenses" });
  if (spendingRatio > 90) alerts.push({ type: "danger", msg: `Spending at ${Math.round(spendingRatio)}% of income — critical.`, action: "Review budget" });
  if (savingsRate < 10) alerts.push({ type: "warn", msg: `Savings rate is ${savingsRate.toFixed(1)}% (recommended: 20%)`, action: "Increase savings" });

  const monthlyTrend = [
    { month: "Feb", income: 52000, expenses: 41000, savings: 11000 },
    { month: "Mar", income: 55000, expenses: 46000, savings: 9000 },
    { month: "Apr", income: 57000, expenses: 44000, savings: 13000 },
    { month: "May", income: totalIncome, expenses: totalExpenses, savings: balance },
  ];

  const projectedSavings = balance * 1.1;
  const financialFreedomScore = Math.min(100, Math.round((balance / (totalExpenses * 3)) * 100));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-950 dark:via-gray-950 dark:to-zinc-950">
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-800 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading your dashboard...</p>
          </div>
        </div>
      )}

      <div className="px-4 pb-24 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 pt-6 pb-4 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="animate-fade-in">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                Welcome back, {user?.name?.split(" ")[0] || "there"} 👋
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Here's your financial snapshot
              </p>
            </div>

            <div className="flex gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative text-sm px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-semibold text-white shadow-lg flex items-center gap-2">
                  <span>💰</span>
                  {daysToPayday} days to payday
                </div>
              </div>
              <div className="relative group">
                <div className="relative text-sm px-4 py-2 bg-white dark:bg-gray-800 rounded-xl font-semibold shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                  <span>📅</span> {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Balance Card */}
        <div className="mb-6 group">
          <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-black rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="relative p-8">
              <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                  TOTAL NET WORTH
                </div>
                <div className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  {fmt(Math.round(animatedValues.balance))}
                </div>
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200/50 dark:border-gray-800/50">
                  <div className="transform hover:scale-105 transition-all cursor-pointer">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Monthly Income</div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">↑ {fmt(Math.round(animatedValues.totalIncome))}</div>
                  </div>
                  <div className="transform hover:scale-105 transition-all cursor-pointer">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total Spent</div>
                    <div className="text-rose-600 dark:text-rose-400 font-bold text-lg">↓ {fmt(Math.round(animatedValues.totalExpenses))}</div>
                  </div>
                  <div className="transform hover:scale-105 transition-all cursor-pointer">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Daily Burn Rate</div>
                    <div className="text-blue-600 dark:text-blue-400 font-bold text-lg">{fmt(Math.round(dailyBurnRate))}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard 
            label="Financial Freedom" 
            value={financialFreedomScore} 
            unit="%" 
            icon="🚀"
            trend="up"
          />
          <MetricCard 
            label="Projected Savings" 
            value={fmt(Math.round(projectedSavings))} 
            icon="📈"
            trend="up"
          />
          <MetricCard 
            label="Survival Days" 
            value={survivalDays} 
            unit="days" 
            icon="⏰"
            trend={survivalDays > 30 ? "up" : "down"}
          />
          <MetricCard 
            label="Savings Rate" 
              value={savingsRate.toFixed(1)} 
            unit="%" 
            icon="💰"
            trend={savingsRate > 15 ? "up" : "down"}
          />
        </div>

        {/* Health Score & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Financial Health Score</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Based on 7 key metrics</p>
              </div>
              <div className="text-4xl">{healthIcon}</div>
            </div>
            <div className="text-center">
              <div className={`text-6xl font-bold mb-3 ${healthColor}`}>{healthScore}</div>
              <div className={`font-semibold text-lg mb-2 ${healthColor}`}>{healthLabel}</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
                <div className={`h-2 rounded-full transition-all duration-1000 ${healthScore >= 70 ? 'bg-emerald-500' : healthScore >= 45 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${healthScore}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                {healthScore >= 70 ? "Excellent financial habits! Keep it up!" : healthScore >= 45 ? "Room for improvement - small changes make a big difference" : "Time to take action - review your spending habits"}
              </p>
            </div>
          </div>

          {/* Alerts Feed */}
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
              Smart Insights
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
              {alerts.length > 0 ? alerts.map((a, i) => (
                <div key={i} className={`p-4 rounded-xl border-l-4 transition-all hover:scale-[1.02] ${a.type === "danger" ? "bg-rose-50 dark:bg-rose-950/20 border-rose-500" : "bg-amber-50 dark:bg-amber-950/20 border-amber-500"}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span>{a.type === "danger" ? "⚠️" : "ℹ️"}</span>
                      <span className="text-gray-700 dark:text-gray-300">{a.msg}</span>
                    </div>
                    {a.action && (
                      <button className="text-xs font-semibold px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all">
                        {a.action} →
                      </button>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">🎉</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">All clear! You're on track!</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Great financial management</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Donut Chart */}
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Spending Breakdown</h3>
              {pieData.length > 5 && (
                <button onClick={() => setShowAllCategories(!showAllCategories)} className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-semibold transition-all">
                  {showAllCategories ? "Show less ↑" : `View all (${pieData.length}) →`}
                </button>
              )}
            </div>
            {pieData.length === 0 ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">No expenses recorded yet</p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      dataKey="value" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={60} 
                      outerRadius={90}
                      paddingAngle={2}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} className="cursor-pointer hover:opacity-80 transition-opacity" />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => fmt(value)}
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        color: '#1f2937'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Category Details */}
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Category Insights</h3>
            <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar pr-2">
              {pieData
                .sort((a, b) => b.value - a.value)
                .slice(0, showAllCategories ? pieData.length : 5)
                .map((item, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="flex items-center gap-3 text-sm mb-2">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                      <div className="flex-1 font-medium text-gray-700 dark:text-gray-300">{item.name}</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{fmt(item.value)}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs font-mono">{Math.round((item.value / totalExpenses) * 100)}%</div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700 group-hover:opacity-80"
                        style={{ 
                          width: `${(item.value / totalExpenses) * 100}%`,
                          backgroundColor: item.color
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Trend Analysis */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300 mb-6">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Financial Trajectory</h3>
            <div className="flex gap-2">
              {['spending', 'savings'].map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    selectedMetric === metric 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {metric === 'spending' ? 'Income vs Expenses' : 'Savings Growth'}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} />
                <YAxis hide />
                <Tooltip 
                  formatter={(value, name) => [fmt(value), name]}
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                {selectedMetric === 'spending' ? (
                  <>
                    <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fill="url(#incomeGradient)" />
                    <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2.5} fill="url(#expenseGradient)" />
                  </>
                ) : (
                  <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 text-center">
          <div className="text-3xl mb-2">💡</div>
          <p className="text-sm text-gray-700 dark:text-gray-300 italic font-medium">"The best time to plant a tree was 20 years ago. The second best time is now."</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">- Your financial journey starts today</p>
        </div>
      </div>
    </div>
  );
}

/* Metric Card Component */
function MetricCard({ label, value, unit, icon, trend }) {
  const trendColor = trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-gray-500";
  const trendIcon = trend === "up" ? "↗" : trend === "down" ? "↘" : "";
  
  return (
    <div className="group bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-800/50 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {trend && <span className={`text-xs font-semibold ${trendColor}`}>{trendIcon}</span>}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{label}</div>
      <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
        {value}{unit && <span className="text-sm ml-0.5 text-gray-500 dark:text-gray-400">{unit}</span>}
      </div>
    </div>
  );
}
