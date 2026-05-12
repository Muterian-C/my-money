import { useApp } from "../App";

export default function InsightsPage() {
  const { survivalDays, savingsRate } = useApp();

  return (
    <div className="page">
      <h1>Insights</h1>

      <p>Survival Days: {survivalDays}</p>
      <p>Savings Rate: {savingsRate.toFixed(1)}%</p>
    </div>
  );
}