import { useState } from "react";
import { useApp } from "../App";
import { savingsService } from "../services/savingsService";
import { motion, AnimatePresence } from "framer-motion";

const fmt = (n) => `KES ${Number(n).toLocaleString()}`;

const colors = [
  { name: "Emerald", value: "#10b981" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Orange", value: "#f97316" },
  { name: "Teal", value: "#14b8a6" },
];

export default function SavingsPage() {
  const { savingsGoals, refetchData, dataLoading } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    target: "",
    saved: "0",
    deadline: "",
    color: "#10b981",
  });

  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.saved, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.target, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const addGoal = async () => {
    if (!form.name || !form.target) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      await savingsService.add({
        name: form.name,
        target: parseFloat(form.target),
        saved: parseFloat(form.saved),
        deadline: form.deadline || null,
        color: form.color,
      });
      
      await refetchData();
      
      setForm({
        name: "",
        target: "",
        saved: "0",
        deadline: "",
        color: "#10b981",
      });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create savings goal");
      console.error("Add goal error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateSaved = async (id, newSaved) => {
    setLoading(true);
    try {
      await savingsService.updateSaved(id, parseFloat(newSaved));
      await refetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update savings");
      console.error("Update error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (id) => {
    if (!window.confirm("Are you sure you want to delete this savings goal?")) return;
    
    setLoading(true);
    try {
      await savingsService.delete(id);
      await refetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete goal");
      console.error("Delete error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading && savingsGoals.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading savings goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full mb-4">
            <span>🎯</span> Goal Tracker
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
            Savings Goals
          </h1>
          <p className="text-gray-600">Track your progress towards financial freedom</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            ⚠️ {error}
          </div>
        )}

        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border shadow-lg mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Savings Progress</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {fmt(totalSaved)} <span className="text-lg text-gray-500">/ {fmt(totalTarget)}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600">{Math.round(overallProgress)}%</div>
              <div className="text-xs text-gray-500">{savingsGoals.length} active goal(s)</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>

        <button
          onClick={() => setShowForm(true)}
          disabled={loading}
          className="group relative w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 mb-8 disabled:opacity-50"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span className="text-xl">+</span> Create New Savings Goal
          </span>
        </button>

        <div className="space-y-4">
          {savingsGoals.length === 0 ? (
            <div className="text-center py-12 bg-white/60 rounded-2xl border">
              <div className="text-6xl mb-4">💰</div>
              <p className="text-gray-500">No savings goals yet</p>
            </div>
          ) : (
            savingsGoals.map((goal) => {
              const progress = (goal.saved / goal.target) * 100;
              const isCompleted = progress >= 100;
              
              return (
                <div key={goal.id} className="group bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl p-5 border shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: goal.color }}></div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{goal.name}</h3>
                        {isCompleted && (
                          <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Completed! 🎉</span>
                        )}
                      </div>
                      {goal.deadline && (
                        <p className="text-xs text-gray-500">Target: {new Date(goal.deadline).toLocaleDateString()}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      disabled={loading}
                      className="text-gray-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold" style={{ color: goal.color }}>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, backgroundColor: goal.color }}></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm mb-3">
                    <div><div className="text-xs text-gray-500">Saved</div><div className="font-semibold">{fmt(goal.saved)}</div></div>
                    <div><div className="text-xs text-gray-500">Remaining</div><div className="font-semibold">{fmt(goal.target - goal.saved)}</div></div>
                    <div><div className="text-xs text-gray-500">Target</div><div className="font-semibold">{fmt(goal.target)}</div></div>
                  </div>

                  {!isCompleted && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500">Update saved:</label>
                        <input
                          type="number"
                          value={goal.saved}
                          onChange={(e) => updateSaved(goal.id, e.target.value)}
                          className="flex-1 px-3 py-1 text-sm bg-gray-50 dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Goal Modal */}
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
                  <h2 className="text-2xl font-bold">Create Savings Goal</h2>
                  <button onClick={() => setShowForm(false)} className="text-2xl">✕</button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Goal Name</label>
                  <input
                    className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g., Emergency Fund, New Laptop"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Target Amount (KES)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                    placeholder="0.00"
                    value={form.target}
                    onChange={(e) => setForm({ ...form, target: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Already Saved (KES)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                    placeholder="0.00"
                    value={form.saved}
                    onChange={(e) => setForm({ ...form, saved: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Target Date (Optional)</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">Goal Color</label>
                  <div className="grid grid-cols-3 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setForm({ ...form, color: color.value })}
                        className={`w-full h-12 rounded-lg transition-all ${form.color === color.value ? "ring-2 ring-offset-2 ring-gray-400 scale-105" : "hover:scale-105"}`}
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={addGoal}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Goal"}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold"
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
