import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { budgetService } from "../services/budgetService";
import { billService } from "../services/billService";
import ProgressiveTrendChart from "../components/ProgressiveTrendChart";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
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
  personalcare: "#e84393",
  church: "#6c5ce7",
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
  personalcare: "Personal Care",
  church: "Church/Tithe",
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
  const [isLoading, setIsLoading] = useState(true);
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [budgetStatus, setBudgetStatus] = useState({ onTrack: 0, warning: 0, exceeded: 0 });
  const [billsSummary, setBillsSummary] = useState(null);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 600);
    loadBudgetSummary();
    loadBillsSummary();
  }, []);

  const loadBudgetSummary = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const summary = await budgetService.getBudgetSummary(currentMonth, currentYear);
      setBudgetSummary(summary);
      
      const stats = summary.categories.reduce((acc, cat) => {
        if (cat.status === 'good') acc.onTrack++;
        else if (cat.status === 'warning') acc.warning++;
        else if (cat.status === 'exceeded') acc.exceeded++;
        return acc;
      }, { onTrack: 0, warning: 0, exceeded: 0 });
      
      setBudgetStatus(stats);
    } catch (err) {
      console.error("Failed to load budget summary:", err);
    }
  };

  const loadBillsSummary = async () => {
    try {
      const summary = await billService.getBillsSummary();
      setBillsSummary(summary);
    } catch (err) {
      console.error("Failed to load bills summary:", err);
    }
  };

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
  
  if (budgetStatus.exceeded > 0) {
    alerts.push({ type: "danger", msg: `${budgetStatus.exceeded} budget categor${budgetStatus.exceeded > 1 ? 'ies are' : 'y is'} exceeded`, action: "View budgets" });
  } else if (budgetStatus.warning > 0) {
    alerts.push({ type: "warn", msg: `${budgetStatus.warning} budget categor${budgetStatus.warning > 1 ? 'ies are' : 'y is'} close to limit`, action: "Check budgets" });
  }

  if (billsSummary && billsSummary.upcoming_bills && billsSummary.upcoming_bills.length > 0) {
    alerts.push({ 
      type: "warn", 
      msg: `${billsSummary.upcoming_bills.length} bill${billsSummary.upcoming_bills.length > 1 ? 's are' : ' is'} due soon`, 
      action: "View bills",
      details: billsSummary.upcoming_bills.map(b => `${b.name} (${b.days_until} days)`).join(", ")
    });
  }

  const projectedSavings = balance * 1.1;
  const financialFreedomScore = Math.min(100, Math.round((balance / (totalExpenses * 3)) * 100));
  const isNewUser = expenses.length === 0;

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
                {isNewUser ? "Welcome to PesaPlan! 👋" : `Welcome back, ${user?.name?.split(" ")[0] || "there"} 👋`}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                {isNewUser ? "Start by adding your first expense" : "Here's your financial snapshot"}
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

        {/* New User Welcome Card */}
        {isNewUser && (
          <div className="mb-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/30">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🎉</div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Welcome to PesaPlan!</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Start by adding your first expense or income. Your dashboard will populate with insights as you track your finances.
                </p>
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => window.location.href = '/expenses'}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-all"
                  >
                    Add Your First Expense →
                  </button>
                  <button
                    onClick={() => window.location.href = '/income'}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-all"
                  >
                    Add Income Source →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bills Summary Card */}
        {billsSummary && billsSummary.bill_count > 0 && (
          <div className="mb-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>📋</span> Monthly Bills Overview
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Track your recurring payments</p>
              </div>
              <button
                onClick={() => window.location.href = '/bills'}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all"
              >
                Manage Bills →
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">{fmt(billsSummary.total_monthly_bills)}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Monthly</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-xl">
                <div className="text-2xl font-bold text-green-600">{fmt(billsSummary.paid_this_month)}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Paid This Month</div>
              </div>
              <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
                <div className="text-2xl font-bold text-amber-600">{fmt(billsSummary.remaining_to_pay)}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Remaining</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">{billsSummary.bill_count}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Active Bills</div>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-400">Payment Progress</span>
                <span className="font-semibold">
                  {Math.round((billsSummary.paid_this_month / billsSummary.total_monthly_bills) * 100)}% Paid
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-indigo-500"
                  style={{ width: `${Math.min((billsSummary.paid_this_month / billsSummary.total_monthly_bills) * 100, 100)}%` }}
                />
              </div>
            </div>

            {billsSummary.upcoming_bills && billsSummary.upcoming_bills.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">⏰ Upcoming Soon</span>
                  <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                    {billsSummary.upcoming_bills.length} bill{billsSummary.upcoming_bills.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-2">
                  {billsSummary.upcoming_bills.slice(0, 3).map((bill, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{bill.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{fmt(bill.amount)}</span>
                        <span className="text-xs text-red-500">
                          Due in {bill.days_until} day{bill.days_until !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                  {billsSummary.upcoming_bills.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{billsSummary.upcoming_bills.length - 3} more bills
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Budget Status Card */}
        {budgetSummary && budgetSummary.categories.length > 0 && (
          <div className="mb-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Budget Status</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Monthly budget vs actual spending</p>
              </div>
              <button
                onClick={() => window.location.href = '/budget'}
                className="px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-all"
              >
                Manage Budgets →
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
                <div className="text-2xl font-bold text-emerald-600">{budgetStatus.onTrack}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">On Track</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-xl">
                <div className="text-2xl font-bold text-yellow-600">{budgetStatus.warning}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Warning</div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-950/30 rounded-xl">
                <div className="text-2xl font-bold text-red-600">{budgetStatus.exceeded}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Exceeded</div>
              </div>
            </div>
            {budgetSummary.total_budget > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
                  <span className="font-semibold">
                    {fmt(Math.round(budgetSummary.total_spent))} / {fmt(Math.round(budgetSummary.total_budget))}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 to-teal-500"
                    style={{ width: `${Math.min((budgetSummary.total_spent / budgetSummary.total_budget) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

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
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span>{a.type === "danger" ? "⚠️" : "ℹ️"}</span>
                        <span className="text-gray-700 dark:text-gray-300">{a.msg}</span>
                      </div>
                      {a.details && (
                        <p className="text-xs text-gray-500 mt-1">{a.details}</p>
                      )}
                    </div>
                    {a.action && (
                      <button 
                        onClick={() => {
                          if (a.action === "View budgets" || a.action === "Check budgets" || a.action === "Manage Budgets →") {
                            window.location.href = '/budget';
                          } else if (a.action === "View bills") {
                            window.location.href = '/bills';
                          }
                        }}
                        className="text-xs font-semibold px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all"
                      >
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

        {/* Trend Analysis - Progressive Chart */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>📈</span> Financial Trends
          </h3>
          <ProgressiveTrendChart expenses={expenses} totalIncome={totalIncome} />
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
