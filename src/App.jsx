import { useState, useEffect, createContext, useContext } from "react";

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ExpensesPage from "./pages/ExpensesPage";
import IncomePage from "./pages/IncomePage";
import SavingsPage from "./pages/SavingsPage";
import InsightsPage from "./pages/InsightsPage";
import SettingsPage from "./pages/SettingsPage";
import AffordabilityTool from "./pages/AffordabilityTool";

import NavBar from "./components/NavBar";

export const AppContext = createContext(null);

const DEMO_USER = {
  name: "Amara Osei",
  email: "amara@example.com",
  currency: "KES",
  payDay: 28,
  avatar: "AO",
};

const DEMO_INCOMES = [
  {
    id: 1,
    source: "Software Intern - TechCorp",
    amount: 45000,
    frequency: "monthly",
    category: "salary",
    date: "2025-05-01",
  },
  {
    id: 2,
    source: "Freelance Design",
    amount: 12000,
    frequency: "monthly",
    category: "freelance",
    date: "2025-05-10",
  },
];

const DEMO_EXPENSES = [
  {
    id: 1,
    name: "Rent - Kilimani",
    amount: 18000,
    category: "rent",
    type: "fixed",
    date: "2025-05-01",
  },
  {
    id: 2,
    name: "HELB Loan",
    amount: 4500,
    category: "helb",
    type: "fixed",
    date: "2025-05-02",
  },
  {
    id: 3,
    name: "Matatu & Transport",
    amount: 3200,
    category: "transport",
    type: "variable",
    date: "2025-05-08",
  },
  {
    id: 4,
    name: "Groceries",
    amount: 5800,
    category: "food",
    type: "variable",
    date: "2025-05-09",
  },
  {
    id: 5,
    name: "Safaricom Data",
    amount: 1200,
    category: "internet",
    type: "fixed",
    date: "2025-05-03",
  },
  {
    id: 6,
    name: "Mum's Upkeep",
    amount: 5000,
    category: "blacktax",
    type: "variable",
    date: "2025-05-05",
  },
  {
    id: 7,
    name: "KPLC Bill",
    amount: 1800,
    category: "utilities",
    type: "variable",
    date: "2025-05-06",
  },
  {
    id: 8,
    name: "Emergency Savings",
    amount: 3000,
    category: "savings",
    type: "fixed",
    date: "2025-05-01",
  },
];

const DEMO_SAVINGS_GOALS = [
  {
    id: 1,
    name: "Emergency Fund",
    target: 90000,
    saved: 37000,
    deadline: "2025-12-31",
    color: "#22c55e",
    icon: "shield",
  },
  {
    id: 2,
    name: "Laptop Upgrade",
    target: 85000,
    saved: 22000,
    deadline: "2025-09-30",
    color: "#6366f1",
    icon: "laptop",
  },
  {
    id: 3,
    name: "Upcountry Trip",
    target: 15000,
    saved: 8500,
    deadline: "2025-08-15",
    color: "#f59e0b",
    icon: "plane",
  },
];

export default function App() {
  const [page, setPage] = useState("landing");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [user, setUser] = useState(DEMO_USER);
  const [incomes, setIncomes] = useState(DEMO_INCOMES);
  const [expenses, setExpenses] = useState(DEMO_EXPENSES);
  const [savingsGoals, setSavingsGoals] = useState(DEMO_SAVINGS_GOALS);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.removeAttribute("data-theme");
    }
  }, [darkMode]);

  // ─────────────────────────────────────
  // CALCULATIONS
  // ─────────────────────────────────────

  const totalIncome = incomes.reduce((sum, income) => {
    return sum + income.amount;
  }, 0);

  const totalExpenses = expenses.reduce((sum, expense) => {
    return sum + expense.amount;
  }, 0);

  const balance = totalIncome - totalExpenses;

  const savingsAmount =
    expenses.find((e) => e.category === "savings")?.amount || 0;

  const savingsRate =
    totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0;

  const today = new Date().getDate();
  const daysInMonth = 31;

  const payDay = user.payDay;

  const daysToPayday =
    payDay >= today
      ? payDay - today
      : daysInMonth - today + payDay;

  const dailyBurnRate = totalExpenses / daysInMonth;

  const survivalDays =
    dailyBurnRate > 0
      ? Math.floor(balance / dailyBurnRate)
      : 999;

  const healthScore = Math.min(
    100,
    Math.max(
      0,
      (balance > 0 ? 30 : 0) +
        (savingsRate >= 20
          ? 25
          : savingsRate >= 10
          ? 15
          : 5) +
        (survivalDays >= 15
          ? 25
          : survivalDays >= 7
          ? 15
          : 5) +
        (totalExpenses / totalIncome < 0.8
          ? 20
          : totalExpenses / totalIncome < 0.95
          ? 10
          : 0)
    )
  );

  // ─────────────────────────────────────
  // CONTEXT
  // ─────────────────────────────────────

  const ctx = {
    page,
    setPage,

    isLoggedIn,
    setIsLoggedIn,

    darkMode,
    setDarkMode,

    user,
    setUser,

    incomes,
    setIncomes,

    expenses,
    setExpenses,

    savingsGoals,
    setSavingsGoals,

    totalIncome,
    totalExpenses,
    balance,

    savingsRate,
    daysToPayday,
    survivalDays,
    healthScore,
    dailyBurnRate,
  };

  // ─────────────────────────────────────
  // AUTH
  // ─────────────────────────────────────

  const handleLogin = () => {
    setIsLoggedIn(true);
    setPage("dashboard");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPage("landing");
  };

  // ─────────────────────────────────────
  // PAGE RENDERING
  // ─────────────────────────────────────

  const renderPage = () => {
    if (!isLoggedIn) {
      if (page === "auth") {
        return <AuthPage onLogin={handleLogin} />;
      }

      return (
        <LandingPage
          onGetStarted={() => setPage("auth")}
        />
      );
    }

    switch (page) {
      case "dashboard":
        return <Dashboard />;

      case "expenses":
        return <ExpensesPage />;

      case "income":
        return <IncomePage />;

      case "savings":
        return <SavingsPage />;

      case "insights":
        return <InsightsPage />;

      case "afford":
        return <AffordabilityTool />;

      case "settings":
        return (
          <SettingsPage
            onLogout={handleLogout}
          />
        );

      default:
        return <Dashboard />;
    }
  };

  // ─────────────────────────────────────
  // UI
  // ─────────────────────────────────────

  return (
    <AppContext.Provider value={ctx}>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white transition-all duration-300">
        
        {/* NAVBAR */}
        {isLoggedIn && (
          <NavBar onLogout={handleLogout} />
        )}

        {/* MAIN */}
        <main
          className={`${
            isLoggedIn ? "pt-20" : ""
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 py-6">
            {renderPage()}
          </div>
        </main>

        {/* BACKGROUND DECOR */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-3xl"></div>

          <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] rounded-full bg-emerald-500/10 blur-3xl"></div>
        </div>
      </div>
    </AppContext.Provider>
  );
}

// ─────────────────────────────────────
// CUSTOM HOOK
// ─────────────────────────────────────

export const useApp = () => {
  return useContext(AppContext);
};