import { useApp } from "../App";

export default function IncomePage() {
  const { incomes } = useApp();

  return (
    <div className="page">
      <h1>Income</h1>

      {incomes.map((i) => (
        <div key={i.id}>
          <p>{i.source}</p>
          <p>KES {i.amount}</p>
        </div>
      ))}
    </div>
  );
}