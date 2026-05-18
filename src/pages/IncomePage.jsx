import { useState, useEffect } from "react";
import { useApp } from "../App";
import { motion, AnimatePresence } from "framer-motion";

const fmt = (n) => `KES ${Number(n).toLocaleString()}`;

export default function IncomePage() {
  const { incomes, setIncomes, totalIncome } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("salary");
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [form, setForm] = useState({
    source: "",
    amount: "",
    frequency: "monthly",
    category: "salary",
  });

  // Animate total income
  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const stepTime = duration / steps;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      setAnimatedTotal(Math.min(totalIncome, totalIncome * progress));
      if (step >= steps) {
        setAnimatedTotal(totalIncome);
        clearInterval(interval);
      }
    }, stepTime);
    return () => clearInterval(interval);
  }, [totalIncome]);

  const addIncome = () => {
    if (!form.source || !form.amount) return;

    setIncomes((prev) => [
      {
        id: Date.now(),
        ...form,
        amount: parseFloat(form.amount),
        date: new Date().toISOString().split("T")[0],
      },
      ...prev, // Add new income at top for better visibility
    ]);

    setForm({
      source: "",
      amount: "",
      frequency: "monthly",
      category: "salary",
    });
    setSelectedCategory("salary");
    setShowForm(false);
  };

  const deleteIncome = (id) => {
    if (window.confirm("Are you sure you want to delete this income source?")) {
      setIncomes((prev) => prev.filter((inc) => inc.id !== id));
    }
  };

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

  const getCategoryIcon = (categoryId) => {
    const cat = incomeCategories.find(c => c.id === categoryId);
    return cat ? cat.icon : "💰";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        
        {/* Header */}
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="text-xs opacity-90 mb-1">Total Monthly Income</div>
            <div className="text-2xl font-bold">{fmt(totalMonthlyIncome)}</div>
            <div className="text-xs opacity-80 mt-2">Recurring monthly</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="text-xs opacity-90 mb-1">Weekly Income (Monthly)</div>
            <div className="text-2xl font-bold">{fmt(totalWeeklyIncome)}</div>
            <div className="text-xs opacity-80 mt-2">From weekly sources</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="text-xs opacity-90 mb-1">One-time Income</div>
            <div className="text-2xl font-bold">{fmt(totalOneTimeIncome)}</div>
            <div className="text-xs opacity-80 mt-2">Bonuses & gifts</div>
          </div>
        </div>

        {/* Total Income Card */}
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-lg mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Income (All Sources)</div>
              <div className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                {fmt(Math.round(animatedTotal))}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">{incomes.length} active source(s)</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">+12% vs last month</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000"
              style={{ width: `${Math.min(100, (totalIncome / 100000) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Add Income Button */}
        <button
          onClick={() => setShowForm(true)}
          className="group relative w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 mb-8 overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span className="text-xl">+</span> Add New Income Source
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>

        {/* Income List */}
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Income Sources</h2>
            <span className="text-xs text-gray-500">{incomes.length} total</span>
          </div>
          
          {incomes.length === 0 ? (
            <div className="text-center py-12 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-800/50">
              <div className="text-6xl mb-4">💸</div>
              <p className="text-gray-500 dark:text-gray-400">No income sources added yet</p>
              <p className="text-xs text-gray-400 mt-2">Click the button above to add your first income source</p>
            </div>
          ) : (
            <AnimatePresence>
              {incomes.map((inc, index) => (
                <motion.div
                  key={inc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-800/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center text-2xl">
                        {getCategoryIcon(inc.category)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{inc.source}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full capitalize">
                            {inc.category}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">
                            {inc.frequency}
                          </span>
                          <span className="text-xs text-gray-400">
                            {inc.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        +{fmt(inc.amount)}
                      </div>
                      <button
                        onClick={() => deleteIncome(inc.id)}
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

        {/* Income Tips Card */}
        <div className="mt-8 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl p-5 border border-emerald-200/50 dark:border-emerald-800/30">
          <div className="flex gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Income Boosting Tips</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Consider diversifying your income streams. Even a small side hustle can add KES 5,000-10,000 monthly. Track all sources to identify opportunities for growth.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Form */}
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
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Income Source</h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Source Name */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Source Name
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="e.g., Salary, Freelance Project, Business Income"
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
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
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                  <div className="grid grid-cols-3 gap-2">
                    {incomeCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setForm({ ...form, category: cat.id });
                          setSelectedCategory(cat.id);
                        }}
                        className={`p-3 rounded-xl text-center transition-all ${
                          form.category === cat.id
                            ? `bg-gradient-to-r ${cat.color} text-white shadow-md scale-105`
                            : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <div className="text-2xl mb-1">{cat.icon}</div>
                        <div className="text-xs font-semibold">{cat.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frequency */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Frequency
                  </label>
                  <div className="flex gap-2">
                    {frequencies.map((freq) => (
                      <button
                        key={freq.id}
                        onClick={() => setForm({ ...form, frequency: freq.id })}
                        className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                          form.frequency === freq.id
                            ? "bg-emerald-500 text-white shadow-md"
                            : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <div className="text-lg mb-1">{freq.icon}</div>
                        <div className="text-xs">{freq.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={addIncome}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Add Income
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
