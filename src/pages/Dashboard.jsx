import { useApp } from "../App";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  Legend,
  Area,
  ComposedChart,
} from "recharts";

const fmt = (n) => `KES ${n.toLocaleString()}`;

const CATEGORY_COLORS = {
  rent: { bg: "bg-indigo-500", light: "#818cf8", dark: "#4338ca" },
  transport: { bg: "bg-amber-500", light: "#fbbf24", dark: "#d97706" },
  food: { bg: "bg-green-500", light: "#22c55e", dark: "#16a34a" },
  internet: { bg: "bg-blue-500", light: "#3b82f6", dark: "#2563eb" },
  helb: { bg: "bg-red-500", light: "#ef4444", dark: "#dc2626" },
  blacktax: { bg: "bg-purple-500", light: "#a855f7", dark: "#7e22ce" },
  savings: { bg: "bg-emerald-500", light: "#10b981", dark: "#059669" },
  utilities: { bg: "bg-orange-500", light: "#f97316", dark: "#ea580c" },
  emergencies: { bg: "bg-pink-500", light: "#ec4899", dark: "#db2777" },
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
    setTimeout(() => setIsLoading(false), 500);
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
    color: CATEGORY_COLORS[k]?.light || "#888",
    originalKey: k,
  }));

  const spendingRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  const healthColor = healthScore >= 70 ? "text-green-500" : healthScore >= 45 ? "text-amber-500" : "text-red-500";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-gray-400">Loading your financial universe...</p>
          </div>
        </div>
      )}

      <div className="px-4 pb-24 max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <div className="sticky top-0 z-20 backdrop-blur-xl bg-black/30 border-b border-white/10 pt-6 pb-4 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {user?.name?.split(" ")[0] || "Financial Warrior"} 👋
              </h1>
              <p className="text-xs text-gray-300 mt-1 flex items-center gap-2">
                <span className="inline-block w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                Your financial universe is thriving
              </p>
            </div>

            <div className="flex gap-3">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative text-sm px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full font-bold shadow-2xl flex items-center gap-2">
                  <span>💰</span>
                  {daysToPayday}d to payday
                </div>
              </div>
              <div className="relative group cursor-pointer">
                <div className="relative text-sm px-4 py-2 bg-white/10 backdrop-blur rounded-full font-semibold hover:bg-white/20 transition-all">
                  <span>📅</span> {new Date().toLocaleDateString('en-US', { month: 'long' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Balance Card */}
        <div className="mb-6">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 rounded-3xl border border-white/20 shadow-2xl">
            <div className="relative">
              <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                TOTAL NET WORTH
              </div>
              <div className="text-5xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                {fmt(Math.round(animatedValues.balance))}
              </div>
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
                <div className="transform hover:scale-105 transition-all cursor-pointer">
                  <div className="text-xs text-gray-400">Monthly Income</div>
                  <div className="text-green-400 font-bold text-lg">↑ {fmt(Math.round(animatedValues.totalIncome))}</div>
                </div>
                <div className="transform hover:scale-105 transition-all cursor-pointer">
                  <div className="text-xs text-gray-400">Total Spent</div>
                  <div className="text-red-400 font-bold text-lg">↓ {fmt(Math.round(animatedValues.totalExpenses))}</div>
                </div>
                <div className="transform hover:scale-105 transition-all cursor-pointer">
                  <div className="text-xs text-gray-400">Daily Burn</div>
                  <div className="text-blue-400 font-bold text-lg">{fmt(Math.round(dailyBurnRate))}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Financial Freedom" value={financialFreedomScore} unit="%" icon="🚀" />
          <StatCard label="Projected Savings" value={fmt(Math.round(projectedSavings))} icon="📈" />
          <StatCard label="Survival Days" value={survivalDays} unit="days" icon="⏰" />
          <StatCard label="Savings Rate" value={savingsRate.toFixed(1)} unit="%" icon="💰" />
        </div>

        {/* Health Score */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold">Financial Health Score</h3>
                <p className="text-xs text-gray-400">Based on 7 key metrics</p>
              </div>
              <div className="text-4xl">{healthIcon}</div>
            </div>
            <div className="text-center">
              <div className={`text-6xl font-bold mb-4 ${healthColor}`}>{healthScore}</div>
              <div className={`font-bold text-lg ${healthColor}`}>{healthLabel}</div>
              <div className="text-xs text-gray-400 mt-2">You're doing {healthScore >= 70 ? 'great!' : healthScore >= 45 ? 'okay' : 'needs work'}</div>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Smart Alerts
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {alerts.length > 0 ? alerts.map((a, i) => (
                <div key={i} className={`p-3 rounded-xl border-l-4 ${a.type === "danger" ? "bg-red-500/10 border-red-500" : "bg-amber-500/10 border-amber-500"}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span>{a.type === "danger" ? "⚠️" : "ℹ️"}</span>
                      <span>{a.msg}</span>
                    </div>
                    {a.action && (
                      <button className="text-xs font-semibold px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                        {a.action} →
                      </button>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-sm">All clear! You're on track!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Pie Chart */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Spending Breakdown</h3>
              <button onClick={() => setShowAllCategories(!showAllCategories)} className="text-xs text-green-400 hover:text-green-300 transition-all">
                {showAllCategories ? "Collapse" : "Expand All"} →
              </button>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={pieData} 
                    dataKey="value" 
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#fff', strokeWidth: 1 }}
                  >
                    {pieData.map((d, i) => (
                      <Cell key={i} fill={d.color} className="cursor-pointer hover:opacity-80 transition-opacity" />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => fmt(value)}
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      padding: '8px 12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category List */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <h3 className="text-lg font-bold mb-4">Category Insights</h3>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {pieData
                .sort((a, b) => b.value - a.value)
                .slice(0, showAllCategories ? pieData.length : 5)
                .map((item, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="flex items-center gap-3 text-sm mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <div className="flex-1 font-medium">{item.name}</div>
                      <div className="font-bold">{fmt(item.value)}</div>
                      <div className="text-gray-400 text-xs">{Math.round((item.value / totalExpenses) * 100)}%</div>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700"
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

        {/* Trend Chart */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 mb-6">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h3 className="text-lg font-bold">Financial Trajectory</h3>
            <div className="flex gap-2">
              {['spending', 'savings', 'income'].map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedMetric === metric ? 'bg-green-500 text-white' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrend}>
                <XAxis dataKey="month" stroke="#888" />
                <YAxis hide />
                <Tooltip 
                  formatter={(value, name) => [fmt(value), name]}
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: 'white'
                  }}
                />
                <Legend />
                {(selectedMetric === 'income' || selectedMetric === 'spending') && (
                  <>
                    <Area type="monotone" dataKey="income" stroke="#22c55e" fill="#22c55e20" strokeWidth={3} />
                    <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="#ef444420" strokeWidth={3} />
                  </>
                )}
                {selectedMetric === 'savings' && (
                  <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={4} dot={{ fill: "#3b82f6", r: 6 }} />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quote */}
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-xl rounded-3xl p-6 border border-white/10 text-center">
          <div className="text-3xl mb-2">💡</div>
          <p className="text-sm italic">"The best time to plant a tree was 20 years ago. The second best time is now."</p>
          <p className="text-xs text-gray-400 mt-2">- Your financial journey starts today</p>
        </div>
      </div>
    </div>
  );
}

/* Simple Stat Card Component */
function StatCard({ label, value, unit, icon }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 hover:border-white/40 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="text-2xl">{icon}</div>
        <div className="text-xs text-gray-400">{label}</div>
      </div>
      <div className="text-2xl font-bold">
        {value}{unit && <span className="text-sm ml-1 text-gray-400">{unit}</span>}
      </div>
    </div>
  );
}
