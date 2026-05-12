import { useApp } from "../App";

export default function SavingsPage() {
  const { savingsGoals } = useApp();

  return (
    <div className="page">
      <h1>Savings Goals</h1>

      {savingsGoals.map((g) => (
        <div key={g.id}>
          <p>{g.name}</p>
          <p>
            KES {g.saved} / {g.target}
          </p>
        </div>
      ))}
    </div>
  );
}