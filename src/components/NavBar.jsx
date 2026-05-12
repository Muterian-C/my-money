import { useApp } from "../App";

export default function NavBar({ onLogout }) {
  const { setPage } = useApp();

  return (
    <nav
      style={{
        padding: "16px",
        background: "#111",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <div>PesaPlan</div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={() => setPage("dashboard")}>Dashboard</button>
        <button onClick={() => setPage("expenses")}>Expenses</button>
        <button onClick={() => setPage("income")}>Income</button>
        <button onClick={() => setPage("savings")}>Savings</button>
        <button onClick={() => setPage("insights")}>Insights</button>
        <button onClick={() => setPage("afford")}>Afford</button>
        <button onClick={() => setPage("settings")}>Settings</button>
        <button onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}