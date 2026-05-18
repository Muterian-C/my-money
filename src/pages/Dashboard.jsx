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
  const [animatedValues, setAnimatedValues] = useState({
    balance: 0,
    totalIncome: 0,
    totalExpenses: 0,
  });

  // Animate numbers on load
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
        setAnimatedValues({
          balance,
          totalIncome,
          totalExpenses,
        });
        clearInterval(interval);
      }
    }, stepTime);
    
    return () => clearInterval(interval);
  }, [balance, totalIncome, totalExpenses]);

  // -------- DERIVED DATA --------
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

  const healthColor =
    healthScore >= 70
      ? "text-green-500"
      : healthScore >= 45
      ? "text-amber-500"
      : "text-red-500";

  const healthLabel =
    healthScore >= 70
      ? "Excellent"
      : healthScore >= 45
      ? "Needs Attention"
      : "Critical";

  const healthIcon =
    healthScore >= 70
      ? "🎉"
      : healthScore >= 45
      ? "⚠️"
      : "🔴";

  const alerts = [];
  if (survivalDays < 10)
    alerts.push({
      type: "danger",
      msg: `You may run out of money in ${survivalDays} days.`,
      action: "Reduce expenses",
    });

  if (spendingRatio > 90)
    alerts.push({
      type: "danger",
      msg: `Spending at ${Math.round(spendingRatio)}% of income — critical.`,
      action: "Review budget",
    });

  if (savingsRate < 10)
    alerts.push({
      type: "warn",
      msg: `Savings rate is ${savingsRate.toFixed(1)}% (recommended: 20%)`,
      action: "Increase savings",
    });

  const monthlyTrend = [
    { month: "Feb", income: 52000, expenses: 41000, savings: 11000 },
    { month: "Mar", income: 55000, expenses: 46000, savings: 9000 },
    { month: "Apr", income: 57000, expenses: 44000, savings: 13000 },
    { month: "May", income: totalIncome, expenses: totalExpenses, savings: balance },
  ];

  // -------- UI --------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white px-4 pb-24">
      
      {/* HEADER with gradient */}
      <div className="sticky top-0 z-10 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 pt-5 pb-3">
        <div className="flex justify-between items-start">
          <div className="animate-slide-in">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Hey, {user?.name?.split(" ")[0] || "there"}! 👋
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Here's your financial snapshot
            </p>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-green-400 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative text-xs px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-semibold shadow-lg">
              💰 {daysToPayday}d to payday
            </div>
          </div>
        </div>
      </div>

      {/* BALANCE CARD - Enhanced with gradient and animation */}
      <div className="mt-4 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 text-white p-6 rounded-2xl relative overflow-hidden shadow-2xl hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500 rounded-full blur-3xl opacity-10"></div>
        
        <div className="relative z-10">
          <div className="text-xs opacity-60 uppercase tracking-wide font-semibold">
            Available Balance
          </div>
          <div className="text-4xl font-bold mt-2 tracking-tight animate-count-up">
            {fmt(Math.round(animatedValues.balance))}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/10">
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-xs opacity-60">Monthly Income</div>
              <div className="font-semibold text-green-400 text-sm">
                +{fmt(Math.round(animatedValues.totalIncome))}
              </div>
            </div>
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-xs opacity-60">Total Spent</div>
              <div className="font-semibold text-red-400 text-sm">
                -{fmt(Math.round(animatedValues.totalExpenses))}
              </div>
            </div>
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-xs opacity-60">Daily Burn Rate</div>
              <div className="font-semibold text-blue-400 text-sm">
                {fmt(Math.round(dailyBurnRate))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK STATS - Enhanced with icons */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <Stat 
          label="Survival Days" 
          value={`${survivalDays}`} 
          unit="days"
          icon="⏰"
          trend={survivalDays > 30 ? "up" : "down"}
        />
        <Stat 
          label="Savings Rate" 
          value={savingsRate.toFixed(1)} 
          unit="%"
          icon="💰"
          trend={savingsRate > 15 ? "up" : "down"}
        />
        <Stat 
          label="Emergency Fund" 
          value="3" 
          unit="months"
          icon="🛡️"
          description="of expenses"
        />
        <Stat 
          label="Spending Ratio" 
          value={Math.round(spendingRatio)} 
          unit="%"
          icon="📊"
          trend={spendingRatio > 70 ? "danger" : "good"}
        />
      </div>

      {/* HEALTH SCORE - Enhanced with progress bar */}
      <div className="mt-4 p-5 border rounded-2xl bg-white dark:bg-gray-800/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{healthIcon}</div>
            <div>
              <div className={`font-bold text-lg ${healthColor}`}>
                Financial Health: {healthLabel}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Based on spending, savings & balance
              </div>
            </div>
          </div>
          <div className={`text-3xl font-bold ${healthColor}`}>
            {healthScore}
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${
              healthScore >= 70 ? "bg-green-500" : healthScore >= 45 ? "bg-amber-500" : "bg-red-500"
            }`}
            style={{ width: `${healthScore}%` }}
          ></div>
        </div>
      </div>

      {/* ALERTS - Enhanced with better styling */}
      {alerts.length > 0 && (
        <div className="mt-4 space-y-2">
          {alerts.map((a, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl border-l-4 ${
                a.type === "danger" 
                  ? "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400" 
                  : "bg-amber-50 dark:bg-amber-900/20 border-amber-500 text-amber-700 dark:text-amber-400"
              } shadow-sm animate-slide-in`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span>⚠️</span>
                  <span>{a.msg}</span>
                </div>
                {a.action && (
                  <button className="text-xs font-semibold underline hover:no-underline">
                    {a.action} →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PIE CHART - Enhanced with interactive tooltip */}
      <Section title="Spending Breakdown">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={pieData} 
                dataKey="value" 
                outerRadius={80}
                innerRadius={40}
                paddingAngle={2}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((d, i) => (
                  <Cell 
                    key={i} 
                    fill={d.color}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => fmt(value)}
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '8px 12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <button 
          onClick={() => setShowAllCategories(!showAllCategories)}
          className="mt-2 text-xs text-green-500 hover:text-green-600 font-semibold"
        >
          {showAllCategories ? "Show less" : "View all categories"} →
        </button>
      </Section>

      {/* TOP SPENDING - Enhanced with progress bars */}
      <Section title="Top Categories">
        <div className="space-y-3">
          {pieData
            .sort((a, b) => b.value - a.value)
            .slice(0, showAllCategories ? pieData.length : 5)
            .map((item, i) => (
              <div key={i} className="group">
                <div className="flex items-center gap-2 text-xs mb-1">
                  <div className={`w-3 h-3 rounded-full bg-[${item.color}]`} style={{ backgroundColor: item.color }} />
                  <div className="flex-1 font-medium">{item.name}</div>
                  <div className="font-semibold">{fmt(item.value)}</div>
                  <div className="text-gray-500">{Math.round((item.value / totalExpenses) * 100)}%</div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                    style={{ 
                      width: `${(item.value / totalExpenses) * 100}%`,
                      backgroundColor: item.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
        </div>
      </Section>

      {/* TREND CHART - Enhanced with multiple metrics */}
      <Section title="Monthly Trend">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrend}>
              <XAxis dataKey="month" stroke="#888" />
              <YAxis hide />
              <Tooltip 
                formatter={(value, name) => [fmt(value), name]}
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#22c55e" 
                strokeWidth={3}
                dot={{ fill: "#22c55e", r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: "#ef4444", r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="savings" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 3 }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Section>
    </div>
  );
}

/* ---------- ENHANCED REUSABLE COMPONENTS ---------- */

function Stat({ label, value, unit, icon, trend, description }) {
  const trendColor = trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : trend === "danger" ? "text-red-500" : "text-gray-500";
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : trend === "danger" ? "⚠️" : "";
  
  return (
    <div className="group p-4 border rounded-2xl bg-white dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {trend && <span className={`text-xs font-semibold ${trendColor}`}>{trendIcon}</span>}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
        {label}
      </div>
      <div className="text-xl font-bold mt-1">
        {value}{unit && <span className="text-sm ml-0.5 text-gray-500">{unit}</span>}
      </div>
      {description && (
        <div className="text-xs text-gray-400 mt-1">{description}</div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mt-6 animate-fade-in">
      <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
        <div className="w-1 h-4 bg-green-500 rounded-full"></div>
        {title}
      </h2>
      <div className="p-4 border rounded-2xl bg-white dark:bg-gray-800/50 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
