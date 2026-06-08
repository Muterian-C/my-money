import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import { budgetService } from "../services/budgetService";
import { expenseService } from "../services/expenseService";

// IMPORTANT: These MUST match the expense categories exactly!
const BUDGET_CATEGORIES = [
  { id: "rent", label: "Rent", icon: "🏠", type: "fixed" },
  { id: "transport", label: "Transport", icon: "🚗", type: "variable" },
  { id: "food", label: "Food", icon: "🍔", type: "variable" },
  { id: "internet", label: "Internet", icon: "🌐", type: "fixed" },
  { id: "helb", label: "HELB", icon: "📚", type: "fixed" },
  { id: "blacktax", label: "Black Tax", icon: "👨‍👩‍👧", type: "variable" },
  { id: "savings", label: "Savings", icon: "💰", type: "fixed" },
  { id: "utilities", label: "Utilities", icon: "💡", type: "fixed" },
  { id: "emergencies", label: "Emergency", icon: "🚨", type: "variable" },
  { id: "entertainment", label: "Entertainment", icon: "🎬", type: "variable" },
  { id: "shopping", label: "Shopping", icon: "🛍️", type: "variable" },
  { id: "health", label: "Health", icon: "🏥", type: "variable" },
   { id: "personalcare", label: "Personal Care", icon: "💇", type: "variable" },
  { id: "church", label: "Church/Tithe", icon: "⛪", type: "variable" },
];

export default function BudgetPage() {
  const { darkMode } = useApp();
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [alerts, setAlerts] = useState([]);

  // Form data for add/edit
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, alertsData] = await Promise.all([
        budgetService.getBudgetSummary(selectedMonth, selectedYear),
        budgetService.getBudgetAlerts(),
      ]);
      setSummary(summaryData);
      setAlerts(alertsData);
    } catch (err) {
      console.error("Failed to load budget data:", err);
      setError("Failed to load budget data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudget = async () => {
    if (!formData.category || !formData.amount) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      await budgetService.createBudget({
        category: formData.category, // This is the category ID that matches expenses!
        amount: parseFloat(formData.amount),
        month: selectedMonth,
        year: selectedYear,
        notes: formData.notes,
      });
      setSuccess("Budget added successfully!");
      setShowAddModal(false);
      resetForm();
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add budget");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleUpdateBudget = async () => {
    if (!formData.category || !formData.amount) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      await budgetService.updateBudget(editingBudget.id, {
        category: formData.category,
        amount: parseFloat(formData.amount),
        month: selectedMonth,
        year: selectedYear,
        notes: formData.notes,
      });
      setSuccess("Budget updated successfully!");
      setEditingBudget(null);
      resetForm();
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update budget");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteBudget = async (id, category) => {
    if (window.confirm(`Delete budget for "${category}"?`)) {
      try {
        await budgetService.deleteBudget(id);
        setSuccess("Budget deleted successfully!");
        loadData();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError("Failed to delete budget");
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      category: "",
      amount: "",
      month: selectedMonth,
      year: selectedYear,
      notes: "",
    });
  };

  const editBudget = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.budget,
      month: selectedMonth,
      year: selectedYear,
      notes: budget.notes || "",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "exceeded":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-emerald-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "exceeded":
        return "Exceeded";
      case "warning":
        return "Warning";
      default:
        return "On Track";
    }
  };

  const getCategoryIcon = (categoryId) => {
    const cat = BUDGET_CATEGORIES.find(c => c.id === categoryId);
    return cat ? cat.icon : "📊";
  };

  const getCategoryLabel = (categoryId) => {
    const cat = BUDGET_CATEGORIES.find(c => c.id === categoryId);
    return cat ? cat.label : categoryId;
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
        
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 rounded-full mb-4">
            <span>💰</span> Financial Planning
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-3">
            Budget Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Set spending limits by category and track your progress
          </p>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl ${
                  alert.type === "exceeded"
                    ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                    : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{alert.type === "exceeded" ? "⚠️" : "⚡"}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {getCategoryLabel(alert.category)} Budget {alert.type === "exceeded" ? "Exceeded" : "Warning"}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{alert.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm">
            {success}
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            + Add Budget
          </button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Budget</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {summary.total_budget.toLocaleString()} KES
              </p>
            </div>
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Spent</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {summary.total_spent.toLocaleString()} KES
              </p>
            </div>
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Remaining</p>
              <p className={`text-3xl font-bold ${summary.total_remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {summary.total_remaining.toLocaleString()} KES
              </p>
            </div>
          </div>
        )}

        {/* Budget List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : summary?.categories?.length === 0 ? (
          <div className="text-center py-12 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-800/50">
            <p className="text-gray-500 dark:text-gray-400">No budgets set for this month.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              Create your first budget →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {summary?.categories.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(category.category)}</span>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {getCategoryLabel(category.category)}
                      </h3>
                    </div>
                    {category.notes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{category.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editBudget(category)}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBudget(category.id, category.category)}
                      className="px-3 py-1 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Spent: {category.spent.toLocaleString()} KES
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Budget: {category.budget.toLocaleString()} KES
                    </span>
                  </div>
                  <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full transition-all duration-500 ${getStatusColor(category.status)}`}
                      style={{ width: `${Math.min(category.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-semibold ${
                      category.status === "exceeded" 
                        ? "text-red-600" 
                        : category.status === "warning" 
                        ? "text-yellow-600" 
                        : "text-emerald-600"
                    }`}>
                      {getStatusText(category.status)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {category.percentage}% used
                    </span>
                  </div>
                  {category.remaining >= 0 ? (
                    <p className="text-xs text-gray-500">
                      Remaining: {category.remaining.toLocaleString()} KES
                    </p>
                  ) : (
                    <p className="text-xs text-red-600">
                      Over budget by: {Math.abs(category.remaining).toLocaleString()} KES
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {(showAddModal || editingBudget) && (
            <div className="fixed inset-0 z-50">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingBudget(null);
                  resetForm();
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {editingBudget ? "Edit Budget" : "Add New Budget"}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select a category</option>
                      {BUDGET_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.label} ({cat.type})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Categories must match your expense categories for accurate tracking.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Monthly Budget (KES) *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 15000"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      placeholder="Additional notes..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowAddModal(false);
                        setEditingBudget(null);
                        resetForm();
                      }}
                      className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={editingBudget ? handleUpdateBudget : handleAddBudget}
                      className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
                    >
                      {editingBudget ? "Update" : "Add"} Budget
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
