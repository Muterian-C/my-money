import { useState } from "react";
import { useApp } from "../App";

const fmt = (n) => `KES ${Number(n).toLocaleString()}`;

export default function IncomePage() {
  const { incomes, setIncomes, totalIncome } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    source: "",
    amount: "",
    frequency: "monthly",
    category: "salary",
  });

  const addIncome = () => {
    if (!form.source || !form.amount) return;

    setIncomes((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...form,
        amount: parseFloat(form.amount),
        date: new Date().toISOString().split("T")[0],
      },
    ]);

    setForm({
      source: "",
      amount: "",
      frequency: "monthly",
      category: "salary",
    });
    setShowForm(false);
  };

  const incomeCategories = [
    { id: "salary", label: "Salary", icon: "💼" },
    { id: "freelance", label: "Freelance", icon: "💻" },
    { id: "business", label: "Business", icon: "🏪" },
    { id: "investment", label: "Investment", icon: "📈" },
    { id: "rental", label: "Rental", icon: "🏠" },
    { id: "other", label: "Other", icon: "💵" },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Income</h1>
          <p className="text-sm text-gray-500">
            {incomes.length} sources this month
          </p>
        </div>

        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
          {fmt(totalIncome)}
        </div>
      </div>

      {/* Card */}
      <div className="bg-gradient-to-br from-green-600 to-green-800 text-white rounded-2xl p-5">
        <p className="text-xs uppercase opacity-70">Total Income</p>
        <h2 className="text-3xl font-bold">{fmt(totalIncome)}</h2>
        <p className="text-sm opacity-70">
          Across {incomes.length} sources
        </p>
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700"
      >
        + Add Income
      </button>

      {/* List */}
      <div className="space-y-3">
        {incomes.map((inc) => (
          <div
            key={inc.id}
            className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm"
          >
            <div>
              <p className="font-semibold">{inc.source}</p>
              <p className="text-xs text-gray-500 capitalize">
                {inc.category} • {inc.frequency}
              </p>
            </div>
            <p className="text-green-600 font-bold">
              +{fmt(inc.amount)}
            </p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end">
          <div className="bg-white w-full p-5 rounded-t-2xl space-y-3">
            <h2 className="text-lg font-bold">Add Income</h2>

            <input
              className="w-full border p-2 rounded"
              placeholder="Source"
              value={form.source}
              onChange={(e) =>
                setForm({ ...form, source: e.target.value })
              }
            />

            <input
              type="number"
              className="w-full border p-2 rounded"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: e.target.value })
              }
            />

            <button
              onClick={addIncome}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Save
            </button>

            <button
              onClick={() => setShowForm(false)}
              className="w-full text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}