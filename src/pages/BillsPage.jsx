import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { billService } from "../services/billService";
import { motion, AnimatePresence } from "framer-motion";

const fmt = (n) => `KES ${Number(n).toLocaleString()}`;

const billCategories = [
  { id: "rent", label: "Rent/Mortgage", icon: "🏠", color: "#6366f1" },
  { id: "electricity", label: "Electricity", icon: "⚡", color: "#f59e0b" },
  { id: "water", label: "Water", icon: "💧", color: "#3b82f6" },
  { id: "internet", label: "Internet", icon: "🌐", color: "#10b981" },
  { id: "phone", label: "Phone/Data", icon: "📱", color: "#8b5cf6" },
  { id: "subscriptions", label: "Subscriptions", icon: "📺", color: "#ec4899" },
  { id: "insurance", label: "Insurance", icon: "🛡️", color: "#14b8a6" },
  { id: "loan", label: "Loan Repayment", icon: "🏦", color: "#ef4444" },
  { id: "helb", label: "HELB", icon: "📚", color: "#f97316" },
  { id: "sacco", label: "SACCO", icon: "🤝", color: "#a855f7" },
  { id: "other", label: "Other Bills", icon: "📄", color: "#6b7280" },
];

const frequencies = [
  { id: "monthly", label: "Monthly", icon: "📅" },
  { id: "quarterly", label: "Quarterly", icon: "📆" },
  { id: "yearly", label: "Yearly", icon: "📅" },
  { id: "weekly", label: "Weekly", icon: "📆" },
];

export default function BillsPage() {
  const { refetchData } = useApp();
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: "rent",
    due_day: 1,
    frequency: "monthly",
    auto_pay: false,
    reminder_days: 3,
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [billsData, summaryData] = await Promise.all([
        billService.getBills(true, false),
        billService.getBillsSummary(),
      ]);
      setBills(billsData);
      setSummary(summaryData);
    } catch (err) {
      console.error("Failed to load bills:", err);
      setError("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBill = async () => {
    if (!form.name || !form.amount || !form.due_day) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      await billService.createBill({
        ...form,
        amount: parseFloat(form.amount),
      });
      setSuccess("Bill added successfully!");
      setShowForm(false);
      resetForm();
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add bill");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBill = async () => {
    if (!form.name || !form.amount || !form.due_day) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      await billService.updateBill(editingBill.id, {
        ...form,
        amount: parseFloat(form.amount),
      });
      setSuccess("Bill updated successfully!");
      setEditingBill(null);
      resetForm();
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update bill");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBill = async (id, name) => {
    if (window.confirm(`Delete "${name}"? This will remove the bill and its payment history.`)) {
      setLoading(true);
      try {
        await billService.deleteBill(id, true);
        setSuccess("Bill deleted successfully!");
        loadData();
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError("Failed to delete bill");
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePayBill = async (billId) => {
    setLoading(true);
    try {
      await billService.payBill(billId, {
        payment_date: new Date().toISOString().split("T")[0],
      });
      setSuccess("Payment recorded successfully! Expense has been added.");
      setShowPaymentModal(null);
      loadData();
      await refetchData(); // Refresh expenses
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  const viewPaymentHistory = async (billId) => {
    try {
      const history = await billService.getPaymentHistory(billId);
      setPaymentHistory(history);
      setShowHistoryModal(billId);
    } catch (err) {
      setError("Failed to load payment history");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      amount: "",
      category: "rent",
      due_day: 1,
      frequency: "monthly",
      auto_pay: false,
      reminder_days: 3,
      notes: "",
    });
  };

  const editBill = (bill) => {
    setEditingBill(bill);
    setForm({
      name: bill.name,
      amount: bill.amount,
      category: bill.category,
      due_day: bill.due_day,
      frequency: bill.frequency,
      auto_pay: bill.auto_pay,
      reminder_days: bill.reminder_days,
      notes: bill.notes || "",
    });
  };

  const getCategoryIcon = (categoryId) => {
    const cat = billCategories.find(c => c.id === categoryId);
    return cat ? cat.icon : "📄";
  };

  const getCategoryColor = (categoryId) => {
    const cat = billCategories.find(c => c.id === categoryId);
    return cat ? cat.color : "#6b7280";
  };

  const getDueDayText = (dueDay) => {
    if (dueDay === 1) return "1st";
    if (dueDay === 2) return "2nd";
    if (dueDay === 3) return "3rd";
    return `${dueDay}th`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-400 rounded-full mb-4">
            <span>📋</span> Bill Manager
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-3">
            Bills & Recurring
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Never miss a payment again. Track all your recurring bills in one place.
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-xl text-red-600 text-sm">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 rounded-xl text-green-600 text-sm">
            ✅ {success}
          </div>
        )}

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-4 text-white shadow-lg">
              <div className="text-xs opacity-90 mb-1">Monthly Bills</div>
              <div className="text-xl font-bold">{fmt(summary.total_monthly_bills)}</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-4 text-white shadow-lg">
              <div className="text-xs opacity-90 mb-1">Paid This Month</div>
              <div className="text-xl font-bold">{fmt(summary.paid_this_month)}</div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-4 text-white shadow-lg">
              <div className="text-xs opacity-90 mb-1">Remaining to Pay</div>
              <div className="text-xl font-bold">{fmt(summary.remaining_to_pay)}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 text-white shadow-lg">
              <div className="text-xs opacity-90 mb-1">Active Bills</div>
              <div className="text-xl font-bold">{summary.bill_count}</div>
            </div>
          </div>
        )}

        {/* Upcoming Bills Alert */}
        {summary?.upcoming_bills?.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">⏰</span>
              <h3 className="font-semibold text-gray-900 dark:text-white">Upcoming Bills</h3>
            </div>
            <div className="space-y-2">
              {summary.upcoming_bills.map((bill) => (
                <div key={bill.id} className="flex justify-between items-center">
                  <span className="text-sm">{bill.name}</span>
                  <span className="text-sm font-semibold">
                    Due in {bill.days_until} day{bill.days_until !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setShowPaymentModal(bill)}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Pay Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Bill Button */}
        <button
          onClick={() => setShowForm(true)}
          disabled={loading}
          className="group relative w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] mb-6 disabled:opacity-50"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span className="text-xl">+</span> Add New Bill
          </span>
        </button>

        {/* Bills List */}
        {loading && bills.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center py-12 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl border">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-500">No bills added yet</p>
            <p className="text-xs text-gray-400 mt-2">Add your first bill to start tracking</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className="group bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ 
                        background: `${getCategoryColor(bill.category)}20`,
                        color: getCategoryColor(bill.category)
                      }}
                    >
                      {getCategoryIcon(bill.category)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{bill.name}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
                          Due {getDueDayText(bill.due_day)}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">{bill.frequency}</span>
                        {bill.auto_pay && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            Auto-pay
                          </span>
                        )}
                      </div>
                      {bill.notes && (
                        <p className="text-xs text-gray-500 mt-1">{bill.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {fmt(bill.amount)}
                    </div>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => viewPaymentHistory(bill.id)}
                        className="text-xs text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        History
                      </button>
                      <button
                        onClick={() => editBill(bill)}
                        className="text-xs text-gray-400 hover:text-emerald-500 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBill(bill.id, bill.name)}
                        className="text-xs text-gray-400 hover:text-rose-500 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowPaymentModal(bill)}
                  className="mt-3 w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-semibold hover:shadow-md transition-all"
                >
                  Pay Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Bill Modal */}
      <AnimatePresence>
        {(showForm || editingBill) && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => {
              setShowForm(false);
              setEditingBill(null);
              resetForm();
            }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-md bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {editingBill ? "Edit Bill" : "Add New Bill"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Bill Name *</label>
                  <input
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Rent, Netflix, Water Bill"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Amount (KES) *</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    {billCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Due Day *</label>
                  <select
                    value={form.due_day}
                    onChange={(e) => setForm({ ...form, due_day: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    {[...Array(31)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}{i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} of month
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Frequency</label>
                  <div className="flex gap-2">
                    {frequencies.map((freq) => (
                      <button
                        key={freq.id}
                        onClick={() => setForm({ ...form, frequency: freq.id })}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                          form.frequency === freq.id
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {freq.icon} {freq.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.auto_pay}
                      onChange={(e) => setForm({ ...form, auto_pay: e.target.checked })}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="text-sm font-semibold">Auto-pay (reminder only)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Reminder Days Before Due</label>
                  <select
                    value={form.reminder_days}
                    onChange={(e) => setForm({ ...form, reminder_days: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl"
                  >
                    {[1, 2, 3, 5, 7].map((days) => (
                      <option key={days} value={days}>{days} day{days !== 1 ? 's' : ''} before</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Notes (Optional)</label>
                  <textarea
                    rows="2"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl"
                                    placeholder="Account number, reference, etc."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingBill(null);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingBill ? handleUpdateBill : handleAddBill}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold disabled:opacity-50"
                  >
                    {loading ? "Saving..." : editingBill ? "Update" : "Add"} Bill
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Confirmation Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPaymentModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl"
            >
              <div className="text-center">
                <div className="text-5xl mb-4">💰</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Pay {showPaymentModal.name}?
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Amount: <span className="font-bold">{fmt(showPaymentModal.amount)}</span>
                </p>
                <p className="text-xs text-gray-400 mb-6">
                  This will create an expense record automatically.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPaymentModal(null)}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handlePayBill(showPaymentModal.id)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold"
                  >
                    {loading ? "Processing..." : "Confirm Payment"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowHistoryModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payment History</h3>
                <button onClick={() => setShowHistoryModal(null)} className="text-2xl">✕</button>
              </div>
              
              {paymentHistory.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No payments recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{fmt(payment.amount_paid)}</div>
                          <div className="text-xs text-gray-500">{payment.payment_date}</div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          payment.status === 'paid' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                      {payment.notes && (
                        <p className="text-xs text-gray-500 mt-2">{payment.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
