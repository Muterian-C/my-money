// In SettingsPage.jsx, change to:
import { useState } from "react";
import { useApp } from "../App";
import { useAuth } from "../context/AuthContext"; // Add this

export default function SettingsPage({ onLogout }) {
  const { darkMode, setDarkMode } = useApp();
  const { user, setUser } = useAuth(); // Get user from auth context
  const [saved, setSaved] = useState(false);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="bg-white p-4 rounded-xl shadow space-y-3">
        <input
          className="w-full border p-2 rounded"
          value={user?.name || ""}
          onChange={(e) =>
            setUser({ ...user, name: e.target.value })
          }
        />

        <input
          className="w-full border p-2 rounded"
          value={user?.email || ""}
          onChange={(e) =>
            setUser({ ...user, email: e.target.value })
          }
        />

        <button
          onClick={() => setSaved(true)}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      <button
        onClick={onLogout}
        className="w-full bg-red-600 text-white py-3 rounded-xl"
      >
        Logout
      </button>
    </div>
  );
}