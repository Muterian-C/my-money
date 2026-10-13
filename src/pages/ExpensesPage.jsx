import { useState, useEffect, useMemo, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppContext } from "../context/AppContext";
import { expenseService } from "../services/expenseService";
import { EXPENSE_CATEGORIES } from "../utils/constants";

/* ------------------------------------------------------------------
   If your expenseService uses different method names, change them here
   (these are the only three lines that talk to the API).
------------------------------------------------------------------ */
const api = {
  add: (payload) => expenseService.add(payload),
  update: (id, payload) => expenseService.update(id, payload),
  remove: (id) => expenseService.delete(id),
};

/* Rows created by balance reconciliation count toward the lifetime balance,
   but are not "spending", so they stay out of monthly totals and charts. */
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
  category: EXPENSE_CATEGORIES[0]?.id || "other",
  type: EXPENSE_CATEGORIES[0]?.type || "variable",
  date: todayStr(),
  note: "",
});

export default function ExpensesPage() {
  const { expenses, refetchData, dataLoading, user } = useContext(AppContext);
  const currency = user?.currency || "KES";
  const fmt = (n) =>
    `${currency} ${Number(n || 0).toLocaleString("en-KE", { maximumFractionDigits: 2 })}`;

  const currentMonth = todayStr().slice(0, 7);

  const [month, setMonth] = useState(currentMonth); // "YYYY-MM" or "all"
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(PAGE_STEP);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [pageError, setPageError] = useState("");

  const isAll = month === "all";

  /* ---------- category helpers ---------- */
  const catOf = (id) => EXPENSE_CATEGORIES.find((c) => c.id === id);
  const iconOf = (id) => catOf(id)?.icon || "💰";
  const colorOf = (id) => catOf(id)?.color || "#6b7280";
  const labelOf = (id) => catOf(id)?.label || id;

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

    // Daily average: days elapsed so far for this month, full length for past months
    let daysCounted = null;
    if (!isAll) {
      daysCounted = month === currentMonth ? dayOf(todayStr()) : daysInMonth(month);
    }
    const dailyAvg = daysCounted ? total / daysCounted : null;

    // Compare with last month (same days elapsed when looking at the current month)
    let delta = null;
    if (!isAll) {
      const prevKey = shiftMonth(month, -1);
      const cutoff = month === currentMonth ? dayOf(todayStr()) : 31;
      const prevTotal = sum(
        expenses.filter(
          (e) =>
            monthKey(e.date) === prevKey &&
            !NON_SPENDING.includes(e.category) &&
            dayOf(e.date) <= cutoff
        )
      );
      if (prevTotal > 0) delta = ((total - prevTotal) / prevTotal) * 100;
    }

    // Category breakdown
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
        if (typeFilter !== "all" && (e.type || "variable") !== typeFilter) return false;
        if (categoryFilter !== "all" && e.category !== categoryFilter) return false;
        if (q) {
          const hay = `${e.description || e.name || ""} ${e.note || ""}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.id - a.id);
  }, [monthList, typeFilter, categoryFilter, search]);

  useEffect(() => {
    setVisible(PAGE_STEP);
  }, [month, typeFilter, categoryFilter, search]);

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
      if (editing) await api.update(editing.id, payload);
      else await api.add(payload);
      await refetchData();
      // Jump to the month the expense belongs to so it's visible straight away
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
      await api.remove(exp.id);
      await refetchData();
    } catch (err) {
      setPageError(err.response?.data?.error || "Could not delete this expense. Try again.");
    }
  };

  /* ---------- loading ---------- */
  if (dataLoading && expenses.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading expenses…</p>
        </div>
      </div>
    );
  }

  const topCategoryTotal = stats.categories[0]?.amount || 0;
  const deltaLabel = month === currentMonth ? "vs same days last month" : "vs previous month";
  const filtersActive = typeFilter !== "all" || categoryFilter !== "all" || search.trim() !== "";

  const inputClass =
    "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500";

  return (
    <div className="px-4 py-6 pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            See where each month's money went.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="shrink-0 bg-rose-500 hover:bg-rose-600 text-white px-5 py-3 rounded-xl font-semibold shadow transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
        >
          + Add expense
        </button>
      </div>

      {/* Month picker */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setMonth(shiftMonth(isAll ? currentMonth : month, -1))}
          aria-label="Previous month"
          className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
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
          className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
        >
          ›
        </button>
        <button
          onClick={() => setMonth(isAll ? currentMonth : "all")}
          className="h-10 px-4 rounded-xl text-sm font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {isAll ? "This month" : "All time"}
        </button>
      </div>

      {pageError && (
        <div role="alert" className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {pageError}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div className="col-span-2 md:col-span-1 bg-rose-500 rounded-2xl p-4 text-white">
          <div className="text-xs opacity-90">{isAll ? "Total spent" : "Spent this month"}</div>
          <div className="text-2xl font-bold mt-1">{fmt(stats.total)}</div>
          {stats.delta !== null && (
            <div className="text-xs opacity-90 mt-2">
              {stats.delta > 0 ? "Up" : "Down"} {Math.abs(stats.delta).toFixed(0)}% {deltaLabel}
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
          <div className="text-xs text-gray-500">Fixed</div>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">{fmt(stats.fixed)}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
          <div className="text-xs text-gray-500">Variable</div>
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">{fmt(stats.variable)}</div>
        </div>
        <div className="col-span-2 md:col-span-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
          <div className="text-xs text-gray-500">Daily average</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
            {stats.dailyAvg === null ? "–" : fmt(stats.dailyAvg)}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-6">
        Lifetime spending across all months: {fmt(lifetimeSpending)}
      </p>

      {/* Where it went */}
      {stats.categories.length > 0 && (
        <section className="mb-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Where it went</h2>
          <ul className="space-y-3">
            {stats.categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">
                    {iconOf(c.id)} {labelOf(c.id)}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {fmt(c.amount)}
                    <span className="text-xs text-gray-500 font-normal ml-2">
                      {((c.amount / stats.total) * 100).toFixed(0)}%
                    </span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(c.amount / topCategoryTotal) * 100}%`,
                      backgroundColor: colorOf(c.id),
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search description or note"
          aria-label="Search expenses"
          className={`${inputClass} sm:flex-1`}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter by category"
          className={`${inputClass} sm:w-52`}
        >
          <option value="all">All categories</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 mb-5" role="group" aria-label="Filter by type">
        {["all", "fixed", "variable"].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            aria-pressed={typeFilter === t}
            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${
              typeFilter === t
                ? "bg-rose-500 text-white"
                : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Transactions</h2>
        <span className="text-xs text-gray-500">{filtered.length} shown</span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            {filtersActive
              ? "No expenses match these filters."
              : isAll
              ? "No expenses yet."
              : `No expenses in ${monthLabel(month)}.`}
          </p>
          {!filtersActive && (
            <button onClick={openAdd} className="mt-3 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:underline">
              Add an expense
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.slice(0, visible).map((exp) => {
            const color = colorOf(exp.category);
            const isAdjustment = NON_SPENDING.includes(exp.category);
            return (
              <li
                key={exp.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 flex items-center gap-3"
              >
                <div
                  className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${color}22` }}
                  aria-hidden="true"
                >
                  {iconOf(exp.category)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white truncate">
                    {exp.description || exp.name}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}22`, color }}>
                      {labelOf(exp.category)}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        exp.type === "fixed"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                          : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {exp.type || "variable"}
                    </span>
                    <span className="text-xs text-gray-500">{dayLabel(exp.date)}</span>
                  </div>
                  {exp.note && <div className="text-xs text-gray-500 mt-1 truncate">{exp.note}</div>}
                </div>

                <div className="text-right shrink-0">
                  <div className={`font-bold ${isAdjustment ? "text-gray-500" : "text-rose-600 dark:text-rose-400"}`}>
                    {fmt(exp.amount)}
                  </div>
                  <div className="flex justify-end gap-3 mt-1">
                    <button
                      onClick={() => openEdit(exp)}
                      className="text-xs font-semibold text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(exp)}
                      className="text-xs font-semibold text-gray-500 hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {filtered.length > visible && (
        <button
          onClick={() => setVisible((v) => v + PAGE_STEP)}
          className="w-full mt-4 py-3 rounded-xl text-sm font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Show more ({filtered.length - visible} left)
        </button>
      )}

      {/* Add / edit modal: one motion element is the direct child of AnimatePresence so the exit animation runs */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="expense-modal"
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
              className="w-full sm:max-w-md bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editing ? "Edit expense" : "Add expense"}
                  </h2>
                  <button
                    onClick={closeForm}
                    aria-label="Close"
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
                  >
                    ✕
                  </button>
                </div>

                {formError && (
                  <div role="alert" className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                    {formError}
                  </div>
                )}

                <label className="block mb-4">
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</span>
                  <input
                    className={inputClass}
                    placeholder="e.g. Groceries, matatu, rent"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    autoFocus
                  />
                </label>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <label className="block">
                    <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Amount ({currency})</span>
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
                  </label>
                  <label className="block">
                    <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date</span>
                    <input
                      type="date"
                      className={inputClass}
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </label>
                </div>

                <div className="mb-4">
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</span>
                  <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto">
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setForm({ ...form, category: cat.id, type: cat.type || form.type })}
                        aria-pressed={form.category === cat.id}
                        className={`p-3 rounded-xl text-left transition-colors ${
                          form.category === cat.id
                            ? "ring-2 ring-rose-500 bg-rose-50 dark:bg-rose-950/30"
                            : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <span className="text-lg mr-2">{cat.icon}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Type</span>
                  <div className="grid grid-cols-2 gap-2" role="group" aria-label="Expense type">
                    {["fixed", "variable"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm({ ...form, type: t })}
                        aria-pressed={form.type === t}
                        className={`py-2.5 rounded-xl text-sm font-semibold capitalize transition-colors ${
                          form.type === t
                            ? "bg-rose-500 text-white"
                            : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block mb-6">
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Note (optional)</span>
                  <input
                    className={inputClass}
                    placeholder="Anything worth remembering"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                  />
                </label>

                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition-colors"
                  >
                    {saving ? "Saving…" : editing ? "Save changes" : "Add expense"}
                  </button>
                  <button
                    onClick={closeForm}
                    className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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