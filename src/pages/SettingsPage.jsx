import { useApp } from "../App";

export default function SettingsPage({ onLogout }) {
  const { darkMode, setDarkMode } = useApp();

  return (
    <div className="page">
      <h1>Settings</h1>

      <button onClick={() => setDarkMode(!darkMode)}>
        Toggle Dark Mode
      </button>

      <br />
      <br />

      <button onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}