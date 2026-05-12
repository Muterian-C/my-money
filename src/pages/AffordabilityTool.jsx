import { useState } from "react";
import { useApp } from "../App";

export default function AffordabilityTool() {
  const [amount, setAmount] = useState("");

  const { balance } = useApp();

  const remaining = balance - Number(amount || 0);

  return (
    <div className="page">
      <h1>Can I Afford This?</h1>

      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <p>Remaining Balance: KES {remaining}</p>
    </div>
  );
}