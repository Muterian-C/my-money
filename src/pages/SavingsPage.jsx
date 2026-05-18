import { useState, useEffect } from "react";
import { useApp } from "../App";
import { motion, AnimatePresence } from "framer-motion";

const fmt = (n) => `KES ${Number(n).toLocaleString()}`;

export default function SavingsPage() {
  const { savingsGoals, setSavingsGoals } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [form, setForm] = useState({
    name: "",
    target: "",
    saved: "0",
    deadline: "",
    color: "#10b981",
  });

  const addGoal = () => {
    if (!form.name || !form.target) return;

    setSavingsGoals((prev) => [
      {
        id: Date.now(),
        ...form,
        target: parseFloat(form.target),
        saved: parseFloat(form.saved),
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    setForm({
      name: "",
      target: "",
      saved: "0",
      deadline: "",
      color: "#10b981",
    });
    setShowForm(false);
  };

  const deleteGoal = (id) => {
    if (window.confirm("Are you sure you want to delete this savings goal?")) {
      setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const updateSaved = (id, newSaved) => {
    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, saved: Math.min(g.target, Math.max(0, parseFloat(newSaved) || 0)) } : g
      )
    );
  };

  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.saved, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.target, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const colors = [
    { name: "Emerald", value: "#10b981" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Pink", value: "#ec4899" },
    { name: "Orange", value: "#f97316" },
    { name: "Red", value: "#ef4444" },
    { name: "Teal", value: "#14b8a6" },
    { name: "Indigo", value: "#6366f1" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 rounded-full mb-4">
            <span>🎯</span> Goal Tracker
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-3">
            Savings Goals
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your progress towards financial freedom
          </p>
        </div>

        {/* Overall Progress Card */}
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-lg mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Savings Progress</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {fmt(totalSaved)} <span className="text-lg text-gray-500">/ {fmt(totalTarget)}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round(overallProgress)}%
              </div>
              <div className="text-xs text-gray-500">{savingsGoals.length} active goal(s)</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-gray-500">Monthly Savings Rate</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {totalSaved > 0 ? Math.round((totalSaved / (totalTarget || 1)) * 100) : 0}% of target
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Estimated Completion</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {overallProgress >= 100 ? "Completed! 🎉" : "In Progress"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Goal Button */}
        <button
          onClick={() => setShowForm(true)}
          className="group relative w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 mb-8 overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span className="text-xl">+</span> Create New Savings Goal
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>

        {/* Goals List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Savings Goals</h2>
            <span className="text-xs text-gray-500">{savingsGoals.length} total</span>
          </div>
          
          {savingsGoals.length === 0 ? (
            <div className="text-center py-12 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-800/50">
              <div className="text-6xl mb-4">💰</div>
              <p className="text-gray-500 dark:text-gray-400">No savings goals yet</p>
              <p className="text-xs text-gray-400 mt-2">Create your first goal to start saving!</p>
            </div>
          ) : (
            <AnimatePresence>
              {savingsGoals.map((goal, index) => {
                const progress = (goal.saved / goal.target) * 100;
                const isCompleted = progress >= 100;
                const remaining = goal.target - goal.saved;
                
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl p-5 border border-gray-200/50 dark:border-gray-800/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: goal.color }}
                          ></div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {goal.name}
                          </h3>
                          {isCompleted && (
                            <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
                              Completed! 🎉
                            </span>
                          )}
                        </div>
                        {goal.deadline && (
                          <p className="text-xs text-gray-500">
                            Target date: {new Date(goal.deadline).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="text-gray-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="font-semibold" style={{ color: goal.color }}>
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-700"
                          style={{ 
                            width: `${progress}%`,
                            backgroundColor: goal.color,
                            backgroundImage: progress < 100 ? 'none' : 'linear-gradient(90deg, #10b981, #14b8a6)'
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm mb-3">
                      <div>
                        <div className="text-xs text-gray-500">Saved</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {fmt(goal.saved)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Remaining</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {fmt(Math.max(0, remaining))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Target</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {fmt(goal.target)}
                        </div>
                      </div>
                    </div>

                    {!isCompleted && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-500">Update saved amount:</label>
                          <input
                            type="number"
                            value={goal.saved}
                            onChange={(e) => updateSaved(goal.id, e.target.value)}
                            className="flex-1 px-3 py-1 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Amount"
                          />
                          <button
                            onClick={() => {
                              const newSaved = prompt("Enter new saved amount:", goal.saved);
                              if (newSaved !== null) updateSaved(goal.id, newSaved);
                            }}
                            className="px-3 py-1 text-xs bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Savings Tips Card */}
        <div className="mt-8 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl p-5 border border-emerald-200/50 dark:border-emerald-800/30">
          <div className="flex gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Savings Tips</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Automate your savings to reach goals faster. Even small amounts add up over time!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
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
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Savings Goal</h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Goal Name */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Goal Name
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="e.g., Emergency Fund, New Laptop, Vacation"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    autoFocus
                  />
                </div>

                {/* Target Amount */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Target Amount (KES)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                    value={form.target}
                    onChange={(e) => setForm({ ...form, target: e.target.value })}
                  />
                </div>

                {/* Already Saved */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Already Saved (KES)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                    value={form.saved}
                    onChange={(e) => setForm({ ...form, saved: e.target.value })}
                  />
                </div>

                {/* Deadline (Optional) */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Target Date (Optional)
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  />
                </div>

                {/* Color Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Goal Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setForm({ ...form, color: color.value })}
                        className={`w-full h-12 rounded-lg transition-all ${
                          form.color === color.value
                            ? "ring-2 ring-offset-2 ring-gray-400 scale-105"
                            : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={addGoal}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Create Goal
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
