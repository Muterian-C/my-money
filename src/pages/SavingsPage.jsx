import { useState } from "react";
import { useApp } from "../App";

const fmt = (n) => `KES ${Number(n).toLocaleString()}`;

export default function SavingsPage() {
  const { savingsGoals, setSavingsGoals } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    target: "",
    saved: "0",
    deadline: "",
    color: "#16a34a",
  });

  const addGoal = () => {
    if (!form.name || !form.target) return;

    setSavingsGoals((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...form,
        target: parseFloat(form.target),
        saved: parseFloat(form.saved),
      },
    ]);

    setShowForm(false);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Savings Goals</h1>

      <button
        onClick={() => setShowForm(true)}
        className="w-full bg-green-600 text-white py-3 rounded-xl"
      >
        + New Goal
      </button>

      <div className="space-y-3">
        {savingsGoals.map((g) => {
          const pct = Math.round((g.saved / g.target) * 100);

          return (
            <div
              key={g.id}
              className="bg-white p-4 rounded-xl shadow"
            >
              <div className="flex justify-between">
                <p className="font-semibold">{g.name}</p>
                <p style={{ color: g.color }} className="font-bold">
                  {pct}%
                </p>
              </div>

              <div className="h-2 bg-gray-200 rounded mt-2">
                <div
                  className="h-2 rounded"
                  style={{
                    width: `${pct}%`,
                    background: g.color,
                  }}
                />
              </div>

              <div className="flex justify-between text-xs mt-2 text-gray-500">
                <span>Saved {fmt(g.saved)}</span>
                <span>Target {fmt(g.target)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end">
          <div className="bg-white w-full p-5 rounded-t-2xl">
            <input
              className="w-full border p-2 mb-2 rounded"
              placeholder="Goal Name"
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              type="number"
              className="w-full border p-2 mb-2 rounded"
              placeholder="Target"
              onChange={(e) =>
                setForm({ ...form, target: e.target.value })
              }
            />

            <button
              onClick={addGoal}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
}