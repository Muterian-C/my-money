import { useAuth } from "../context/AuthContext";
import { useApp } from "../App";

const navItems = [
  { id: "dashboard", icon: "⬡", label: "Home" },
  { id: "expenses", icon: "↑", label: "Expenses" },
  { id: "income", icon: "↓", label: "Income" },
  { id: "savings", icon: "◎", label: "Goals" },
  { id: "insights", icon: "◈", label: "Insights" },
];

export default function NavBar() {
  const { user } = useAuth();
  const { page, setPage, darkMode, setDarkMode } = useApp();

  // Generate avatar initials from real user name
  const avatar = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <>
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 backdrop-blur-md bg-white/70 dark:bg-black/50 border-b border-gray-200 dark:border-gray-800">

        {/* Brand */}
        <div className="text-lg font-bold tracking-tight">
          Pesa<span className="text-green-500">Plan</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage("afford")}
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            title="Can I Afford This?"
          >
            💡
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            title="Toggle theme"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          <button
            onClick={() => setPage("settings")}
            className="w-9 h-9 rounded-full bg-gray-900 text-white dark:bg-white dark:text-black font-bold text-xs"
            title="Profile"
          >
            {avatar}
          </button>
        </div>
      </nav>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black pb-[env(safe-area-inset-bottom)]">
        <div className="flex">
          {navItems.map((item) => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className="flex-1 flex flex-col items-center py-2 text-xs transition"
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg transition ${
                    active
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {item.icon}
                </div>
                <span
                  className={`mt-1 font-medium ${
                    active
                      ? "text-black dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}