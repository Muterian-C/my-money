import { useApp } from "../App";

export default function ExpensesPage() {
  const { expenses } = useApp();

  return (
    <div className="page">
      <h1>Expenses</h1>

      {expenses.map((e) => (
        <div key={e.id}>
          <p>{e.name}</p>
          <p>KES {e.amount}</p>
        </div>
      ))}
    </div>
  );
}