import { useState, useEffect } from "react";
import { useApp } from "../App";
import { expenseService } from "../services/expenseService";
import { budgetService } from "../services/budgetService";
import { motion, AnimatePresence } from "framer-motion";

const fmt = (n) => `KES ${Number(n).toLocaleString()}`;

const CATEGORIES = [
  { id: "rent", label: "Rent", icon: "🏠", type: "fixed", color: "#6366f1" },
  { id: "transport", label: "Transport", icon: "🚗", type: "variable", color: "#f59e0b" },
  { id: "food", label: "Food", icon: "🍔", type: "variable", color: "#10b981" },
  { id: "internet", label: "Internet", icon: "🌐", type: "fixed", color: "#3b82f6" },
  { id: "helb", label: "HELB", icon: "📚", type: "fixed", color: "#ef4444" },
  { id: "blacktax", label: "Black Tax", icon: "👨‍👩‍👧", type: "variable", color: "#8b5cf6" },
  { id: "savings", label: "Savings", icon: "💰", type: "fixed", color: "#14b8a6" },
  { id: "utilities", label: "Utilities", icon: "💡", type: "fixed", color: "#f97316" },
  { id: "emergencies", label: "Emergency", icon: "🚨", type: "variable", color: "#ec4899" },
  { id: "entertainment", label: "Entertainment", icon: "🎬", type: "variable", color: "#a855f7" },
  { id: "shopping", label: "Shopping", icon: "🛍️", type: "variable", color: "#06b6d4" },
  { id: "health", label: "Health", icon: "🏥", type: "variable", color: "#14b8a6" },
];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "fixed", label: "Fixed" },
  { id: "variable", label: "Variable" },
  ...CATEGORIES.map(c => ({ id: c.id, label: c.label })),
];

export default function ExpensesPage() {
  const { expenses, setExpenses, refetchData, dataLoading } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [budgetWarnings, setBudgetWarnings] = useState([]);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "food",
    type: "variable",
    date: new Date().toISOString().split("T")[0],
  });

  // Load budget warnings when expenses change
  useEffect(() => {
    checkBudgetWarnings();
  }, [expenses]);

  const checkBudgetWarnings = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const budgetSummary = await budgetService.getBudgetSummary(currentMonth, currentYear);
      
      const warnings = budgetSummary.categories
        .filter(cat => cat.status === 'warning' || cat.status === 'exceeded')
        .map(cat => ({
          category: cat.category,
          status: cat.status,
          message: cat.status === 'exceeded' 
            ? `You've exceeded your ${cat.category} budget by ${Math.abs(cat.remaining).toLocaleString()} KES`
            : `You've used ${cat.percentage}% of your ${cat.category} budget`,
          percentage: cat.percentage
        }));
      
      setBudgetWarnings(warnings);
    } catch (err) {
      console.error("Failed to load budget warnings:", err);
    }
  };

  const fixedTotal = expenses
    .filter(e => e.type === "fixed")
    .reduce((sum, e) => sum + e.amount, 0);
  
  const variableTotal = expenses
    .filter(e => e.type === "variable")
    .reduce((sum, e) => sum + e.amount, 0);

  const filteredExpenses = expenses.filter((e) => {
    if (filter === "all") return true;
    if (filter === "fixed") return e.type === "fixed";
    if (filter === "variable") return e.type === "variable";
    return e.category === filter;
  });

  const addExpense = async () => {
    if (!form.description || !form.amount) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      await expenseService.add({
        description: form.description,
        amount: parseFloat(form.amount),
        category: form.category,
        type: form.type,
        date: form.date,
      });
      
      await refetchData(); // Refresh data from backend
      await checkBudgetWarnings(); // Check budget warnings again
      
      setForm({
        description: "",
        amount: "",
        category: "food",
        type: "variable",
        date: new Date().toISOString().split("T")[0],
      });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add expense");
      console.error("Add expense error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    
    setLoading(true);
    try {
      await expenseService.delete(id);
      await refetchData(); // Refresh data from backend
      await checkBudgetWarnings(); // Check budget warnings again
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete expense");
      console.error("Delete expense error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryId) => {
    const cat = CATEGORIES.find(c => c.id === categoryId);
    return cat ? cat.icon : "💰";
  };

  const getCategoryColor = (categoryId) => {
    const cat = CATEGORIES.find(c => c.id === categoryId);
    return cat ? cat.color : "#888";
  };

  if (dataLoading && expenses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-rose-100 to-orange-100 dark:from-rose-900/30 dark:to-orange-900/30 text-rose-700 dark:text-rose-400 rounded-full mb-4">
            <span>💸</span> Expense Tracker
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-3">
            Your Expenses
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage all your spending
          </p>
        </div>

        {/* Budget Warnings */}
        {budgetWarnings.length > 0 && (
          <div className="mb-4 space-y-2">
            {budgetWarnings.map((warning, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl ${
                  warning.status === 'exceeded'
                    ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                    : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{warning.status === 'exceeded' ? "⚠️" : "⚡"}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {warning.category} Budget {warning.status === 'exceeded' ? 'Exceeded!' : 'Warning'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{warning.message}</p>
                  </div>
                  <button
                    onClick={() => window.location.href = '/budget'}
                    className="text-xs px-3 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all"
                  >
                    View Budget →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="text-xs opacity-90 mb-1">Total Spending</div>
            <div className="text-2xl font-bold">{fmt(expenses.reduce((s, e) => s + e.amount, 0))}</div>
            <div className="text-xs opacity-80 mt-2">All time</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="text-xs opacity-90 mb-1">Fixed Expenses</div>
            <div className="text-2xl font-bold">{fmt(fixedTotal)}</div>
            <div className="text-xs opacity-80 mt-2">Monthly bills</div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="text-xs opacity-90 mb-1">Variable Expenses</div>
            <div className="text-2xl font-bold">{fmt(variableTotal)}</div>
            <div className="text-xs opacity-80 mt-2">Daily spending</div>
          </div>
        </div>

        {/* Add Expense Button */}
        <button
          onClick={() => setShowForm(true)}
          disabled={loading}
          className="group relative w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 mb-6 overflow-hidden disabled:opacity-50"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span className="text-xl">+</span> Add New Expense
          </span>
        </button>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  filter === f.id
                    ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md"
                    : "bg-white/60 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expenses List */}
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {filter === "all" ? "All Transactions" : FILTERS.find(f => f.id === filter)?.label}
            </h2>
            <span className="text-xs text-gray-500">{filteredExpenses.length} transactions</span>
          </div>
          
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-800/50">
              <div className="text-6xl mb-4">💸</div>
              <p className="text-gray-500 dark:text-gray-400">No expenses recorded yet</p>
              <p className="text-xs text-gray-400 mt-2">Click the button above to add your first expense</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="group bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-800/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ 
                          background: `linear-gradient(135deg, ${getCategoryColor(expense.category)}20, ${getCategoryColor(expense.category)}10)`,
                          color: getCategoryColor(expense.category)
                        }}
                      >
                        {getCategoryIcon(expense.category)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{expense.description}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span 
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ 
                              backgroundColor: `${getCategoryColor(expense.category)}20`,
                              color: getCategoryColor(expense.category)
                            }}
                          >
                            {CATEGORIES.find(c => c.id === expense.category)?.label || expense.category}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            expense.type === "fixed" 
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                              : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                          }`}>
                            {expense.type}
                          </span>
                          <span className="text-xs text-gray-500">{expense.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-rose-600 dark:text-rose-400">
                        -{fmt(expense.amount)}
                      </div>
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        disabled={loading}
                        className="text-xs text-gray-400 hover:text-rose-500 transition-colors mt-1 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Budget Tip */}
        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">Smart Budgeting Tip</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-500">Set monthly budgets for each category to track your spending and save more!</p>
            </div>
            <button
              onClick={() => window.location.href = '/budget'}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-all"
            >
              Set Budgets →
            </button>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Expense</h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="e.g., Groceries, Uber, Rent"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    autoFocus
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Amount (KES)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setForm({ ...form, category: cat.id, type: cat.type })}
                        className={`p-3 rounded-xl text-left transition-all ${
                          form.category === cat.id
                            ? "ring-2 ring-rose-500 bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30"
                            : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{cat.icon}</span>
                          <div>
                            <div className="text-sm font-semibold">{cat.label}</div>
                            <div className="text-xs text-gray-500 capitalize">{cat.type}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={addExpense}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? "Adding..." : "Add Expense"}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
