import { useApp } from "../App";

export default function Dashboard() {
  const {
    totalIncome,
    totalExpenses,
    balance,
    healthScore,
  } = useApp();

  return (
    <div className="page">
      <h1>Dashboard</h1>

      <p>Total Income: KES {totalIncome}</p>
      <p>Total Expenses: KES {totalExpenses}</p>
      <p>Balance: KES {balance}</p>
      <p>Health Score: {healthScore}/100</p>
    </div>
  );
}