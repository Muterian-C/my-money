import { useState, useEffect } from "react";
import { useApp } from "../App";
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
  const { expenses, setExpenses, totalExpenses } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "food",
    type: "variable",
    date: new Date().toISOString().split("T")[0],
  });

  // Calculate totals by type
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

  const addExpense = () => {
    if (!form.description || !form.amount) return;

    const categoryData = CATEGORIES.find(c => c.id === form.category);
    
    setExpenses((prev) => [
      {
        id: Date.now(),
        ...form,
        amount: parseFloat(form.amount),
        type: categoryData?.type || "variable",
        date: form.date || new Date().toISOString().split("T")[0],
      },
      ...prev,
    ]);

    setForm({
      description: "",
      amount: "",
      category: "food",
      type: "variable",
      date: new Date().toISOString().split("T")[0],
    });
    setShowForm(false);
  };

  const deleteExpense = (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="text-xs opacity-90 mb-1">Total Spending</div>
            <div className="text-2xl font-bold">{fmt(totalExpenses)}</div>
            <div className="text-xs opacity-80 mt-2">All time</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="text-xs opacity-90 mb-1">Fixed Expenses</div>
            <div className="text-2xl font-bold">{fmt(fixedTotal)}</div>
            <div className="text-xs opacity-80 mt-2">Monthly bills & subscriptions</div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="text-xs opacity-90 mb-1">Variable Expenses</div>
            <div className="text-2xl font-bold">{fmt(variableTotal)}</div>
            <div className="text-xs opacity-80 mt-2">Daily spending & leisure</div>
          </div>
        </div>

        {/* Add Expense Button */}
        <button
          onClick={() => setShowForm(true)}
          className="group relative w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 mb-6 overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span className="text-xl">+</span> Add New Expense
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
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
                {f.icon && <span className="mr-1">{f.icon}</span>}
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
            <AnimatePresence>
              {filteredExpenses.map((expense, index) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
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
                        className="text-xs text-gray-400 hover:text-rose-500 transition-colors mt-1 opacity-0 group-hover:opacity-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Summary Card */}
        <div className="mt-6 p-5 bg-gradient-to-r from-rose-500/10 to-orange-500/10 rounded-2xl border border-rose-200/50 dark:border-rose-800/30">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span>📊</span> Spending Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Fixed Expenses</span>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${totalExpenses > 0 ? (fixedTotal / totalExpenses) * 100 : 0}%` }}
                  />
                </div>
                <strong className="text-gray-900 dark:text-white">{fmt(fixedTotal)}</strong>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Variable Expenses</span>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${totalExpenses > 0 ? (variableTotal / totalExpenses) * 100 : 0}%` }}
                  />
                </div>
                <strong className="text-gray-900 dark:text-white">{fmt(variableTotal)}</strong>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-rose-200/50 dark:border-rose-800/30">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total Spent</span>
              <strong className="text-rose-600 dark:text-rose-400 text-lg">{fmt(totalExpenses)}</strong>
            </div>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="mt-6 bg-gradient-to-r from-rose-500/10 to-orange-500/10 rounded-2xl p-4 border border-rose-200/50 dark:border-rose-800/30">
          <div className="flex gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Pro Tip</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Try to keep variable expenses under 30% of your income. Track small daily purchases - they add up quickly!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
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

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    placeholder="e.g., Groceries, Uber, Rent"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    autoFocus
                  />
                </div>

                {/* Amount */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Amount (KES)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>

                {/* Category */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setForm({ ...form, category: cat.id })}
                        className={`p-3 rounded-xl text-left transition-all ${
                          form.category === cat.id
                            ? "ring-2 ring-rose-500 bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30"
                            : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
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

                {/* Date */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={addExpense}
                    className="flex-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Add Expense
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
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
