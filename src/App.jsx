import { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "./context/AuthContext";

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

import { incomeService } from "./services/incomeService";
import { expenseService } from "./services/expenseService";
import { savingsService } from "./services/savingsService";

export const AppContext = createContext(null);

export default function App() {
  const { isAuthenticated, loading: authLoading, logout } = useAuth();

  const [page, setPage] = useState("landing");
  const [darkMode, setDarkMode] = useState(false);

  // ─── Real data from backend ───
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  // ─────────────────────────────────────
  // DARK MODE
  // ─────────────────────────────────────
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
  // REDIRECT AFTER AUTH
  // ─────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      setPage("dashboard");
      fetchAllData();
    } else if (!authLoading) {
      setPage("landing");
    }
  }, [isAuthenticated, authLoading]);

  // ─────────────────────────────────────
  // FETCH ALL DATA FROM BACKEND
  // ─────────────────────────────────────
  const fetchAllData = async () => {
    setDataLoading(true);
    try {
      const [incRes, expRes, savRes] = await Promise.all([
        incomeService.getAll(),
        expenseService.getAll(),
        savingsService.getAll(),
      ]);
      setIncomes(incRes.data);
      setExpenses(expRes.data);
      setSavingsGoals(savRes.data);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setDataLoading(false);
    }
  };

  // ─────────────────────────────────────
  // CALCULATIONS (derived from real data)
  // ─────────────────────────────────────
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;

  const savingsAmount =
    expenses.find((e) => e.category === "savings")?.amount || 0;
  const savingsRate =
    totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0;

  const today = new Date().getDate();
  const daysInMonth = 31;
  const payDay = 28; // fallback; SettingsPage can update from user profile
  const daysToPayday =
    payDay >= today ? payDay - today : daysInMonth - today + payDay;
  const dailyBurnRate = totalExpenses / daysInMonth;
  const survivalDays =
    dailyBurnRate > 0 ? Math.floor(balance / dailyBurnRate) : 999;

  const healthScore = Math.min(
    100,
    Math.max(
      0,
      (balance > 0 ? 30 : 0) +
        (savingsRate >= 20 ? 25 : savingsRate >= 10 ? 15 : 5) +
        (survivalDays >= 15 ? 25 : survivalDays >= 7 ? 15 : 5) +
        (totalExpenses / totalIncome < 0.8
          ? 20
          : totalExpenses / totalIncome < 0.95
          ? 10
          : 0)
    )
  );

  // ─────────────────────────────────────
  // AUTH HANDLERS
  // ─────────────────────────────────────
  const handleLogin = () => {
    // isAuthenticated effect above handles navigation + fetch
  };

  const handleLogout = () => {
    logout();
    setIncomes([]);
    setExpenses([]);
    setSavingsGoals([]);
    setPage("landing");
  };

  // ─────────────────────────────────────
  // CONTEXT VALUE
  // ─────────────────────────────────────
  const ctx = {
    page,
    setPage,

    darkMode,
    setDarkMode,

    incomes,
    setIncomes,
    expenses,
    setExpenses,
    savingsGoals,
    setSavingsGoals,

    dataLoading,
    refetchData: fetchAllData,

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
  // LOADING SCREEN (auth check in progress)
  // ─────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading PesaPlan...</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────
  // PAGE RENDERING
  // ─────────────────────────────────────
  const renderPage = () => {
    if (!isAuthenticated) {
      if (page === "auth") {
        return <AuthPage onLogin={handleLogin} />;
      }
      return <LandingPage onGetStarted={() => setPage("auth")} />;
    }

    switch (page) {
      case "dashboard":  return <Dashboard />;
      case "expenses":   return <ExpensesPage />;
      case "income":     return <IncomePage />;
      case "savings":    return <SavingsPage />;
      case "insights":   return <InsightsPage />;
      case "afford":     return <AffordabilityTool />;
      case "settings":   return <SettingsPage onLogout={handleLogout} />;
      default:           return <Dashboard />;
    }
  };

  return (
    <AppContext.Provider value={ctx}>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white transition-all duration-300">

        {isAuthenticated && <NavBar onLogout={handleLogout} />}

        <main className={isAuthenticated ? "pt-20" : ""}>
          <div className="max-w-7xl mx-auto px-4 py-6">
            {renderPage()}
          </div>
        </main>

        {/* Background decor */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] rounded-full bg-emerald-500/10 blur-3xl" />
        </div>
      </div>
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);