import { useApp } from "../App";

export default function InsightsPage() {
  const {
    expenses,
    totalIncome,
    totalExpenses,
    savingsRate,
    survivalDays,
    healthScore,
  } = useApp();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Insights</h1>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Health Score" value={healthScore} />
        <Stat label="Savings Rate" value={`${savingsRate}%`} />
        <Stat label="Survival" value={`${survivalDays}d`} />
        <Stat label="Income" value={`KES ${totalIncome}`} />
        <Stat label="Expenses" value={`KES ${totalExpenses}`} />
      </div>

      <div className="bg-yellow-50 p-4 rounded-xl">
        <p className="font-semibold">Advice</p>
        <p className="text-sm text-gray-600">
          Reduce variable spending or you're heading toward cash stress.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white p-3 rounded-xl shadow">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}