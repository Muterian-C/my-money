import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import { expenseService } from "../services/expenseService";
import { budgetService } from "../services/budgetService";

// Same ids as BudgetPage, so a budget and its expenses always line up.
// (Later you can move this list to utils/constants and import it in both pages.)
const EXPENSE_CATEGORIES = [
  { id: "rent", label: "Rent", icon: "🏠", type: "fixed", color: "#3b82f6" },
  { id: "transport", label: "Transport", icon: "🚗", type: "variable", color: "#f59e0b" },
  { id: "food", label: "Food", icon: "🍔", type: "variable", color: "#ef4444" },
  { id: "internet", label: "Internet", icon: "🌐", type: "fixed", color: "#06b6d4" },
  { id: "helb", label: "HELB", icon: "📚", type: "fixed", color: "#8b5cf6" },
  { id: "blacktax", label: "Black Tax", icon: "👨‍👩‍👧", type: "variable", color: "#ec4899" },
  { id: "savings", label: "Savings", icon: "💰", type: "fixed", color: "#10b981" },
  { id: "utilities", label: "Utilities", icon: "💡", type: "fixed", color: "#eab308" },
  { id: "emergencies", label: "Emergency", icon: "🚨", type: "variable", color: "#dc2626" },
  { id: "entertainment", label: "Entertainment", icon: "🎬", type: "variable", color: "#a855f7" },
  { id: "shopping", label: "Shopping", icon: "🛍️", type: "variable", color: "#f43f5e" },
  { id: "health", label: "Health", icon: "🏥", type: "variable", color: "#14b8a6" },
  { id: "personalcare", label: "Personal Care", icon: "💇", type: "variable", color: "#d946ef" },
  { id: "church", label: "Church/Tithe", icon: "⛪", type: "variable", color: "#6366f1" },
  { id: "other", label: "Other", icon: "💸", type: "variable", color: "#6b7280" },
];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "fixed", label: "Fixed" },
  { id: "variable", label: "Variable" },
  ...EXPENSE_CATEGORIES.map((c) => ({ id: c.id, label: `${c.icon} ${c.label}` })),
];

const STATUS_COLOR = { exceeded: "#ef4444", warning: "#eab308", good: "#10b981" };

// Balance reconciliation rows count toward the lifetime balance only, not monthly spending.
const NON_SPENDING = ["reconciliation", "adjustment"];
const PAGE_STEP = 20;

/* ---------- date helpers (local time, so Nairobi dates never shift) ---------- */
const pad = (n) => String(n).padStart(2, "0");
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const monthKey = (dateStr) => (dateStr || "").slice(0, 7);
const dayOf = (dateStr) => Number((dateStr || "").slice(8, 10));
const daysInMonth = (key) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m, 0).getDate();
};
const shiftMonth = (key, delta) => {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
const monthLabel = (key) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-KE", { month: "long", year: "numeric" });
};
const dayLabel = (dateStr) => {
  const [y, m, d] = (dateStr || "").slice(0, 10).split("-").map(Number);
  if (!y) return "";
  return new Date(y, m - 1, d).toLocaleDateString("en-KE", { day: "numeric", month: "short" });
};
const sum = (list) => list.reduce((s, e) => s + Number(e.amount || 0), 0);

const emptyForm = () => ({
  description: "",
  amount: "",
  category: "food",
  type: "variable",
  date: todayStr(),
  note: "",
});

export default function ExpensesPage() {
  const { expenses, refetchData, dataLoading, user } = useApp();
  const navigate = useNavigate();
  const currency = user?.currency || "KES";
  const fmt = (n) => `${currency} ${Number(n || 0).toLocaleString("en-KE", { maximumFractionDigits: 2 })}`;

  const currentMonth = todayStr().slice(0, 7);

  const [month, setMonth] = useState(currentMonth); // "YYYY-MM" or "all"
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(PAGE_STEP);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [pageError, setPageError] = useState("");
  const [budgetSummary, setBudgetSummary] = useState(null);

  const isAll = month === "all";
  // Edit only shows if your expenseService has an update() method
  const canEdit = typeof expenseService.update === "function";

  /* ---------- category helpers ---------- */
  const catOf = (id) => EXPENSE_CATEGORIES.find((c) => c.id === id);
  const iconOf = (id) => catOf(id)?.icon || "💰";
  const colorOf = (id) => catOf(id)?.color || "#6b7280";
  const labelOf = (id) => catOf(id)?.label || id;

  /* ---------- budget data for the selected month ---------- */
  useEffect(() => {
    if (isAll) {
      setBudgetSummary(null);
      return;
    }
    let cancelled = false;
    budgetService
      .getBudgetSummary(Number(month.slice(5, 7)), Number(month.slice(0, 4)))
      .then((s) => !cancelled && setBudgetSummary(s))
      .catch(() => !cancelled && setBudgetSummary(null));
    return () => {
      cancelled = true;
    };
  }, [month, isAll, expenses]);

  const budgetMap = useMemo(
    () => Object.fromEntries((budgetSummary?.categories || []).map((c) => [c.category, c])),
    [budgetSummary]
  );
  const budgetWarnings = (budgetSummary?.categories || []).filter(
    (c) => c.status === "warning" || c.status === "exceeded"
  );

  /* ---------- derived data ---------- */
  const monthList = useMemo(
    () => (isAll ? expenses : expenses.filter((e) => monthKey(e.date) === month)),
    [expenses, month, isAll]
  );

  const stats = useMemo(() => {
    const spending = monthList.filter((e) => !NON_SPENDING.includes(e.category));
    const total = sum(spending);
    const fixed = sum(spending.filter((e) => e.type === "fixed"));
    const variable = sum(spending.filter((e) => e.type !== "fixed"));

    let dailyAvg = null;
    let delta = null;
    if (!isAll) {
      const daysCounted = month === currentMonth ? dayOf(todayStr()) : daysInMonth(month);
      dailyAvg = daysCounted ? total / daysCounted : null;

      // Compare with last month (same days elapsed when viewing the current month)
      const cutoff = month === currentMonth ? dayOf(todayStr()) : 31;
      const prevTotal = sum(
        expenses.filter(
          (e) =>
            monthKey(e.date) === shiftMonth(month, -1) &&
            !NON_SPENDING.includes(e.category) &&
            dayOf(e.date) <= cutoff
        )
      );
      if (prevTotal > 0) delta = ((total - prevTotal) / prevTotal) * 100;
    }

    const byCat = {};
    spending.forEach((e) => {
      byCat[e.category] = (byCat[e.category] || 0) + Number(e.amount || 0);
    });
    const categories = Object.entries(byCat)
      .map(([id, amount]) => ({ id, amount }))
      .sort((a, b) => b.amount - a.amount);

    return { total, fixed, variable, dailyAvg, delta, categories };
  }, [monthList, expenses, month, isAll, currentMonth]);

  const lifetimeSpending = useMemo(
    () => sum(expenses.filter((e) => !NON_SPENDING.includes(e.category))),
    [expenses]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return monthList
      .filter((e) => {
        if (filter === "fixed" && e.type !== "fixed") return false;
        if (filter === "variable" && e.type === "fixed") return false;
        if (filter !== "all" && filter !== "fixed" && filter !== "variable" && e.category !== filter) {
          return false;
        }
        if (q) {
          const hay = `${e.description || e.name || ""} ${e.note || ""}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.id - a.id);
  }, [monthList, filter, search]);

  useEffect(() => {
    setVisible(PAGE_STEP);
  }, [month, filter, search]);

  /* ---------- actions ---------- */
  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm(), date: !isAll && month !== currentMonth ? `${month}-01` : todayStr() });
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (exp) => {
    setEditing(exp);
    setForm({
      description: exp.description || exp.name || "",
      amount: String(exp.amount),
      category: exp.category,
      type: exp.type || "variable",
      date: (exp.date || "").slice(0, 10),
      note: exp.note || "",
    });
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (!saving) setShowForm(false);
  };

  const handleSave = async () => {
    const amount = parseFloat(form.amount);
    if (!form.description.trim()) return setFormError("Add a short description.");
    if (!amount || amount <= 0) return setFormError("Enter an amount greater than 0.");
    if (!form.date) return setFormError("Pick a date.");

    setSaving(true);
    setFormError("");
    const payload = {
      name: form.description.trim(),
      amount,
      category: form.category,
      type: form.type,
      date: form.date,
      note: form.note.trim(),
    };

    try {
      if (editing) await expenseService.update(editing.id, payload);
      else await expenseService.add(payload);
      await refetchData();
      // Jump to the month the expense belongs to so it shows up straight away
      if (!isAll) setMonth(monthKey(form.date));
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.error || "Could not save this expense. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (exp) => {
    if (!window.confirm(`Delete "${exp.description || exp.name}"?`)) return;
    setPageError("");
    try {
      await expenseService.delete(exp.id);
      await refetchData();
    } catch (err) {
      setPageError(err.response?.data?.error || "Could not delete this expense. Try again.");
    }
  };

  /* ---------- loading ---------- */
  if (dataLoading && expenses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading expenses...</p>
        </div>
      </div>
    );
  }

  const deltaLabel = month === currentMonth ? "vs same days last month" : "vs previous month";
  const filtersActive = filter !== "all" || search.trim() !== "";
  const topCategoryTotal = stats.categories[0]?.amount || 0;

  const panel =
    "bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-800/50";
  const inputClass =
    "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500";

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
          <p className="text-gray-600 dark:text-gray-400">Track and manage all your spending</p>
        </div>

        {/* Month picker */}
        <div className={`${panel} p-2 flex items-center gap-2 mb-6`}>
          <button
            onClick={() => setMonth(shiftMonth(isAll ? currentMonth : month, -1))}
            aria-label="Previous month"
            className="w-10 h-10 rounded-lg text-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            ‹
          </button>
          <div className="flex-1 text-center font-semibold text-gray-900 dark:text-white">
            {isAll ? "All time" : monthLabel(month)}
          </div>
          <button
            onClick={() => setMonth(shiftMonth(month, 1))}
            disabled={isAll || month >= currentMonth}
            aria-label="Next month"
            className="w-10 h-10 rounded-lg text-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
          >
            ›
          </button>
          <button
            onClick={() => setMonth(isAll ? currentMonth : "all")}
            className="h-10 px-4 rounded-lg text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isAll ? "This month" : "All time"}
          </button>
        </div>

        {/* Budget warnings */}
        {budgetWarnings.length > 0 && (
          <div className="mb-4 space-y-2">
            {budgetWarnings.map((w) => (
              <div
                key={w.id}
                className={`p-3 rounded-xl ${
                  w.status === "exceeded"
                    ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                    : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{w.status === "exceeded" ? "⚠️" : "⚡"}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {labelOf(w.category)} budget {w.status === "exceeded" ? "exceeded" : "warning"}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {w.status === "exceeded"
                        ? `Over by ${fmt(Math.abs(w.remaining))}`
                        : `${w.percentage}% used, ${fmt(w.remaining)} left`}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/budget")}
                    className="text-xs px-3 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all"
                  >
                    View budget →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {pageError && (
          <div role="alert" className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            ⚠️ {pageError}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
          <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="text-xs opacity-90 mb-1">{isAll ? "Total spending" : "Spent this month"}</div>
            <div className="text-2xl font-bold">{fmt(stats.total)}</div>
            <div className="text-xs opacity-80 mt-2">
              {stats.delta !== null
                ? `${stats.delta > 0 ? "Up" : "Down"} ${Math.abs(stats.delta).toFixed(0)}% ${deltaLabel}`
                : isAll
                ? "Across all months"
                : "No earlier month to compare"}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="text-xs opacity-90 mb-1">Fixed expenses</div>
            <div className="text-2xl font-bold">{fmt(stats.fixed)}</div>
            <div className="text-xs opacity-80 mt-2">Rent, bills, commitments</div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="text-xs opacity-90 mb-1">Variable expenses</div>
            <div className="text-2xl font-bold">{fmt(stats.variable)}</div>
            <div className="text-xs opacity-80 mt-2">
              {stats.dailyAvg !== null ? `About ${fmt(stats.dailyAvg)} a day` : "Daily spending"}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-6">Lifetime spending across all months: {fmt(lifetimeSpending)}</p>

        {/* Where it went */}
        {stats.categories.length > 0 && (
          <div className={`${panel} p-5 mb-6`}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Where it went</h2>
            <div className="space-y-4">
              {stats.categories.slice(0, 8).map((c) => {
                const b = budgetMap[c.id];
                const barColor = b ? STATUS_COLOR[b.status] || STATUS_COLOR.good : colorOf(c.id);
                const width = b ? Math.min(b.percentage, 100) : (c.amount / topCategoryTotal) * 100;
                return (
                  <div key={c.id}>
                    <div className="flex justify-between items-baseline text-sm mb-1.5">
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {iconOf(c.id)} {labelOf(c.id)}
                      </span>
                      <span className="text-gray-900 dark:text-white font-semibold">
                        {fmt(c.amount)}
                        <span className="text-xs text-gray-500 font-normal ml-2">
                          {b ? `of ${fmt(b.budget)}` : `${((c.amount / stats.total) * 100).toFixed(0)}%`}
                        </span>
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${width}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add button */}
        <button
          onClick={openAdd}
          className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 mb-6"
        >
          <span className="flex items-center justify-center gap-2">
            <span className="text-xl">+</span> Add New Expense
          </span>
        </button>

        {/* Search + filters */}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search description or note"
          aria-label="Search expenses"
          className={`${inputClass} mb-3`}
        />
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
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

        {/* List */}
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {filter === "all" ? "All Transactions" : FILTERS.find((f) => f.id === filter)?.label}
            </h2>
            <span className="text-xs text-gray-500">{filtered.length} transactions</span>
          </div>

          {filtered.length === 0 ? (
            <div className={`${panel} text-center py-12 rounded-2xl`}>
              <div className="text-6xl mb-4">💸</div>
              <p className="text-gray-500 dark:text-gray-400">
                {filtersActive
                  ? "No expenses match these filters"
                  : isAll
                  ? "No expenses recorded yet"
                  : `No expenses in ${monthLabel(month)}`}
              </p>
              {!filtersActive && <p className="text-xs text-gray-400 mt-2">Tap the button above to add one</p>}
            </div>
          ) : (
            filtered.slice(0, visible).map((expense) => {
              const color = colorOf(expense.category);
              const isAdjustment = NON_SPENDING.includes(expense.category);
              return (
                <div
                  key={expense.id}
                  className={`${panel} p-4 shadow-sm hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-2xl"
                        style={{ background: `linear-gradient(135deg, ${color}33, ${color}11)` }}
                      >
                        {iconOf(expense.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {expense.description || expense.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: `${color}22`, color }}
                          >
                            {labelOf(expense.category)}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              expense.type === "fixed"
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                            }`}
                          >
                            {expense.type || "variable"}
                          </span>
                          <span className="text-xs text-gray-500">{dayLabel(expense.date)}</span>
                        </div>
                        {expense.note && <p className="text-xs text-gray-500 mt-1 truncate">{expense.note}</p>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className={`text-lg font-bold ${
                          isAdjustment ? "text-gray-500" : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        -{fmt(expense.amount)}
                      </div>
                      <div className="flex justify-end gap-3 mt-1">
                        {canEdit && (
                          <button
                            onClick={() => openEdit(expense)}
                            className="text-xs font-semibold text-gray-500 hover:text-blue-500 transition-colors"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(expense)}
                          className="text-xs font-semibold text-gray-500 hover:text-rose-500 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {filtered.length > visible && (
            <button
              onClick={() => setVisible((v) => v + PAGE_STEP)}
              className={`${panel} w-full py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
            >
              Show more ({filtered.length - visible} left)
            </button>
          )}
        </div>

        {/* Budget tip */}
        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">Smart Budgeting Tip</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-500">
                Set a monthly budget for each category to see how close you are to the limit.
              </p>
            </div>
            <button
              onClick={() => navigate("/budget")}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-all"
            >
              Set Budgets →
            </button>
          </div>
        </div>
      </div>

      {/* Add / edit sheet. A single motion element sits directly under AnimatePresence so the exit animation runs. */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="expense-sheet"
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeForm}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={editing ? "Edit expense" : "Add expense"}
              className="w-full sm:max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto"
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editing ? "Edit Expense" : "Add Expense"}
                  </h2>
                  <button
                    onClick={closeForm}
                    aria-label="Close"
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {formError && (
                  <div role="alert" className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                    ⚠️ {formError}
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <input
                    className={inputClass}
                    placeholder="e.g., Groceries, Uber, Rent"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Amount ({currency})
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      className={inputClass}
                      placeholder="0.00"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date</label>
                    <input
                      type="date"
                      className={inputClass}
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                </div>

                {/* Categories: all visible, no inner scrolling */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setForm({ ...form, category: cat.id, type: cat.type })}
                        aria-pressed={form.category === cat.id}
                        className={`p-3 rounded-xl text-center transition-all ${
                          form.category === cat.id
                            ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md scale-105"
                            : "bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <div className="text-2xl mb-1">{cat.icon}</div>
                        <div className="text-xs font-semibold leading-tight">{cat.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Type</label>
                  <div className="flex gap-2">
                    {["fixed", "variable"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm({ ...form, type: t })}
                        aria-pressed={form.type === t}
                        className={`flex-1 py-3 rounded-xl text-sm font-semibold capitalize transition-all ${
                          form.type === t
                            ? "bg-rose-500 text-white shadow-md"
                            : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Note (optional)
                  </label>
                  <input
                    className={inputClass}
                    placeholder="Anything worth remembering"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {saving ? "Saving..." : editing ? "Save Changes" : "Add Expense"}
                  </button>
                  <button
                    onClick={closeForm}
                    className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
