import { useState, useEffect } from "react";
import { useApp } from "../App";
import { incomeService } from "../services/incomeService";
import { budgetService } from "../services/budgetService";
import { motion, AnimatePresence } from "framer-motion";

const fmt = (n) => `KES ${Number(n).toLocaleString()}`;

const incomeCategories = [
  { id: "salary", label: "Salary", icon: "💼", color: "from-blue-500 to-blue-600" },
  { id: "freelance", label: "Freelance", icon: "💻", color: "from-purple-500 to-purple-600" },
  { id: "business", label: "Business", icon: "🏪", color: "from-amber-500 to-amber-600" },
  { id: "investment", label: "Investment", icon: "📈", color: "from-emerald-500 to-emerald-600" },
  { id: "rental", label: "Rental", icon: "🏠", color: "from-teal-500 to-teal-600" },
  { id: "other", label: "Other", icon: "💵", color: "from-gray-500 to-gray-600" },
];

const frequencies = [
  { id: "monthly", label: "Monthly", icon: "📅" },
  { id: "weekly", label: "Weekly", icon: "📆" },
  { id: "one-time", label: "One-time", icon: "⭐" },
];

export default function IncomePage() {
  const { incomes, refetchData, dataLoading } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [form, setForm] = useState({
    source: "",
    amount: "",
    frequency: "monthly",
    category: "salary",
    date: new Date().toISOString().split("T")[0],
  });

  // Load budget summary
  useEffect(() => {
    loadBudgetSummary();
  }, []);

  const loadBudgetSummary = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const summary = await budgetService.getBudgetSummary(currentMonth, currentYear);
      setBudgetSummary(summary);
    } catch (err) {
      console.error("Failed to load budget summary:", err);
    }
  };

  const totalMonthlyIncome = incomes
    .filter(inc => inc.frequency === "monthly")
    .reduce((sum, inc) => sum + inc.amount, 0);
  
  const totalWeeklyIncome = incomes
    .filter(inc => inc.frequency === "weekly")
    .reduce((sum, inc) => sum + inc.amount * 4, 0);
  
  const totalOneTimeIncome = incomes
    .filter(inc => inc.frequency === "one-time")
    .reduce((sum, inc) => sum + inc.amount, 0);

  const totalAllIncome = totalMonthlyIncome + totalWeeklyIncome + totalOneTimeIncome;

  const addIncome = async () => {
    if (!form.source || !form.amount) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      await incomeService.add({
        source: form.source,
        amount: parseFloat(form.amount),
        frequency: form.frequency,
        category: form.category,
        date: form.date,
      });
      
      await refetchData();
      await loadBudgetSummary();
      
      setForm({
        source: "",
        amount: "",
        frequency: "monthly",
        category: "salary",
        date: new Date().toISOString().split("T")[0],
      });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add income");
      console.error("Add income error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteIncome = async (id) => {
    if (!window.confirm("Are you sure you want to delete this income source?")) return;
    
    setLoading(true);
    try {
      await incomeService.delete(id);
      await refetchData();
      await loadBudgetSummary();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete income");
      console.error("Delete income error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading && incomes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading income data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 rounded-full mb-4">
            <span>💰</span> Income Tracker
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-3">
            Your Income
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track all your income sources in one place
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-xl text-red-600 text-sm">
            ⚠️ {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="text-xs opacity-90 mb-1">Total Monthly Income</div>
            <div className="text-2xl font-bold">{fmt(totalMonthlyIncome)}</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="text-xs opacity-90 mb-1">Weekly Income (Monthly)</div>
            <div className="text-2xl font-bold">{fmt(totalWeeklyIncome)}</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="text-xs opacity-90 mb-1">One-time Income</div>
            <div className="text-2xl font-bold">{fmt(totalOneTimeIncome)}</div>
          </div>
        </div>

        {/* Income vs Budget Section */}
        {budgetSummary && budgetSummary.total_budget > 0 && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">💰</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Income vs Budget Allocation</span>
              </div>
              <button 
                onClick={() => window.location.href = '/budget'}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Manage Budgets →
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Total Monthly Income</div>
                <div className="text-xl font-bold text-blue-600">{fmt(totalAllIncome)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Total Budget</div>
                <div className="text-xl font-bold text-emerald-600">{fmt(budgetSummary.total_budget)}</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">Budget Usage</span>
                <span className="font-semibold">
                  {fmt(budgetSummary.total_spent)} / {fmt(budgetSummary.total_budget)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-blue-500 transition-all"
                  style={{ width: `${Math.min((budgetSummary.total_spent / budgetSummary.total_budget) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 {totalAllIncome > budgetSummary.total_budget 
                  ? `You have ${fmt(totalAllIncome - budgetSummary.total_budget)} above your budget. Consider increasing your savings!`
                  : `You're living within your budget! Great job! 🎉`}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowForm(true)}
          disabled={loading}
          className="group relative w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] mb-8 disabled:opacity-50"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span className="text-xl">+</span> Add New Income Source
          </span>
        </button>

        <div className="space-y-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Income Sources</h2>
            <span className="text-xs text-gray-500">{incomes.length} total</span>
          </div>
          
          {incomes.length === 0 ? (
            <div className="text-center py-12 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl border">
              <div className="text-6xl mb-4">💸</div>
              <p className="text-gray-500">No income sources added yet</p>
            </div>
          ) : (
            incomes.map((income) => (
              <div
                key={income.id}
                className="group bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center text-2xl">
                      {incomeCategories.find(c => c.id === income.category)?.icon || "💰"}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{income.source}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full capitalize">{income.category}</span>
                        <span className="text-xs text-gray-500 capitalize">{income.frequency}</span>
                        <span className="text-xs text-gray-400">{income.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">+{fmt(income.amount)}</div>
                    <button
                      onClick={() => deleteIncome(income.id)}
                      disabled={loading}
                      className="text-xs text-gray-400 hover:text-rose-500 transition-colors mt-1 opacity-0 group-hover:opacity-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Income Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Add Income Source</h2>
                  <button onClick={() => setShowForm(false)} className="text-2xl">✕</button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Source Name</label>
                  <input
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g., Salary, Freelance Project"
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Amount (KES)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {incomeCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setForm({ ...form, category: cat.id })}
                        className={`p-3 rounded-xl text-center transition-all ${
                          form.category === cat.id
                            ? `bg-gradient-to-r ${cat.color} text-white shadow-md scale-105`
                            : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100"
                        }`}
                      >
                        <div className="text-2xl mb-1">{cat.icon}</div>
                        <div className="text-xs font-semibold">{cat.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">Frequency</label>
                  <div className="flex gap-2">
                    {frequencies.map((freq) => (
                      <button
                        key={freq.id}
                        onClick={() => setForm({ ...form, frequency: freq.id })}
                        className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                          form.frequency === freq.id
                            ? "bg-emerald-500 text-white shadow-md"
                            : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100"
                        }`}
                      >
                        <div className="text-lg mb-1">{freq.icon}</div>
                        <div className="text-xs">{freq.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={addIncome}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                  >
                    {loading ? "Adding..." : "Add Income"}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 py-3 rounded-xl font-semibold"
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
