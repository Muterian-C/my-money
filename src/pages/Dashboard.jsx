import { useApp } from "../App";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
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
  RadialBarChart,
  RadialBar,
} from "recharts";

const fmt = (n) => `KES ${n.toLocaleString()}`;

const CATEGORY_COLORS = {
  rent: { bg: "bg-indigo-500", light: "#818cf8", dark: "#4338ca", gradient: "from-indigo-500 to-indigo-600" },
  transport: { bg: "bg-amber-500", light: "#fbbf24", dark: "#d97706", gradient: "from-amber-500 to-amber-600" },
  food: { bg: "bg-green-500", light: "#22c55e", dark: "#16a34a", gradient: "from-green-500 to-green-600" },
  internet: { bg: "bg-blue-500", light: "#3b82f6", dark: "#2563eb", gradient: "from-blue-500 to-blue-600" },
  helb: { bg: "bg-red-500", light: "#ef4444", dark: "#dc2626", gradient: "from-red-500 to-red-600" },
  blacktax: { bg: "bg-purple-500", light: "#a855f7", dark: "#7e22ce", gradient: "from-purple-500 to-purple-600" },
  savings: { bg: "bg-emerald-500", light: "#10b981", dark: "#059669", gradient: "from-emerald-500 to-emerald-600" },
  utilities: { bg: "bg-orange-500", light: "#f97316", dark: "#ea580c", gradient: "from-orange-500 to-orange-600" },
  emergencies: { bg: "bg-pink-500", light: "#ec4899", dark: "#db2777", gradient: "from-pink-500 to-pink-600" },
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
  const [timeRange, setTimeRange] = useState("6months");
  const [isLoading, setIsLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  
  // Parallax effect on mouse move
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    setTimeout(() => setIsLoading(false), 500);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-x-hidden">
      
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translate(${mousePosition.x * 50}px, ${mousePosition.y * 50}px)` }}
        ></div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-gray-400">Loading your financial universe...</p>
          </div>
        </div>
      )}

      <div className="relative z-10 px-4 pb-24 max-w-7xl mx-auto">
        
        {/* Hero Section with 3D Effect */}
        <div className="sticky top-0 z-20 backdrop-blur-xl bg-black/30 border-b border-white/10 pt-6 pb-4 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="animate-slide-in-right">
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
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity animate-pulse"></div>
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

        {/* Main Balance Card - 3D Flip Effect */}
        <div className="perspective-1000 mb-6 group">
          <div className="relative transform-style-3d transition-all duration-500 group-hover:rotate-y-180">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
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
        </div>

        {/* Advanced Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <AdvancedStat 
            label="Financial Freedom" 
            value={financialFreedomScore} 
            unit="%" 
            icon="🚀"
            color="from-purple-500 to-pink-500"
          />
          <AdvancedStat 
            label="Projected Savings" 
            value={projectedSavings} 
            format="currency"
            icon="📈"
            color="from-blue-500 to-cyan-500"
          />
          <AdvancedStat 
            label="Survival Days" 
            value={survivalDays} 
            unit="days" 
            icon="⏰"
            color="from-orange-500 to-red-500"
          />
          <AdvancedStat 
            label="Savings Rate" 
            value={savingsRate.toFixed(1)} 
            unit="%" 
            icon="💰"
            color="from-green-500 to-emerald-500"
          />
        </div>

        {/* Health Score with Gauge Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-green-500/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold">Financial Health Score</h3>
                <p className="text-xs text-gray-400">Based on 7 key metrics</p>
              </div>
              <div className="text-4xl">{healthIcon}</div>
            </div>
            <div className="relative h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="60%" 
                  outerRadius="100%" 
                  data={[{ name: 'Health', value: healthScore, fill: healthScore >= 70 ? '#10b981' : healthScore >= 45 ? '#f59e0b' : '#ef4444' }]} 
                  startAngle={180} 
                  endAngle={0}
                >
                  <RadialBar background clockWise dataKey="value" cornerRadius={10} />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-current">
                    {healthScore}
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-4">
              <div className={`font-bold text-lg ${healthColor}`}>{healthLabel}</div>
              <div className="text-xs text-gray-400">You're doing {healthScore >= 70 ? 'great!' : healthScore >= 45 ? 'okay' : 'needs work'}</div>
            </div>
          </div>

          {/* Alerts Feed */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Smart Alerts
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
              {alerts.length > 0 ? alerts.map((a, i) => (
                <div key={i} className={`p-3 rounded-xl border-l-4 ${a.type === "danger" ? "bg-red-500/10 border-red-500" : "bg-amber-500/10 border-amber-500"} animate-slide-in`}>
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

        {/* Interactive Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 3D Pie Chart */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:shadow-2xl transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Spending Universe</h3>
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
                      <Cell 
                        key={i} 
                        fill={d.color}
                        className="cursor-pointer transition-all duration-300 hover:opacity-80 hover:scale-105"
                      />
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

          {/* Category Breakdown */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <h3 className="text-lg font-bold mb-4">Category Insights</h3>
            <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar pr-2">
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
                        className="h-full rounded-full transition-all duration-700 group-hover:opacity-80"
                        style={{ 
                          width: `${(item.value / totalExpenses) * 100}%`,
                          backgroundColor: item.color,
                          boxShadow: '0 0 10px rgba(34,197,94,0.3)'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Trend Analysis with Area Chart */}
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
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                    <Area type="monotone" dataKey="income" stroke="#22c55e" fill="url(#incomeGradient)" strokeWidth={3} />
                    <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#expenseGradient)" strokeWidth={3} />
                  </>
                )}
                {selectedMetric === 'savings' && (
                  <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={4} dot={{ fill: "#3b82f6", r: 6 }} />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Motivational Quote Card */}
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-xl rounded-3xl p-6 border border-white/10 text-center">
          <div className="text-3xl mb-2">💡</div>
          <p className="text-sm italic">"The best time to plant a tree was 20 years ago. The second best time is now."</p>
          <p className="text-xs text-gray-400 mt-2">- Your financial journey starts today</p>
        </div>
      </div>
    </div>
  );
}

/* Advanced Stat Component with Animation */
function AdvancedStat({ label, value, unit, icon, color, format }) {
  const [isHovered, setIsHovered] = useState(false);
  const displayValue = format === 'currency' ? fmt(Math.round(value)) : value;
  
  return (
    <div 
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${color} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-all duration-500 ${isHovered ? 'scale-105' : ''}`}></div>
      <div className="relative bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 hover:border-white/40 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="text-2xl">{icon}</div>
          <div className="text-xs text-gray-400">{label}</div>
        </div>
        <div className="text-2xl font-bold">
          {displayValue}{unit && <span className="text-sm ml-1 text-gray-400">{unit}</span>}
        </div>
      </div>
    </div>
  );
}
