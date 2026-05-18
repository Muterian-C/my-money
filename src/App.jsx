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
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  // Real data from backend
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  // ─────────────────────────────────────
  // DARK MODE PERSISTENCE
  // ─────────────────────────────────────
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
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
      
      // Set incomes directly
      setIncomes(incRes.data || []);
      
      // Map backend 'name' field to frontend 'description' for expenses
      setExpenses((expRes.data || []).map(exp => ({
        ...exp,
        description: exp.name // Convert name to description for frontend
      })));
      
      // Set savings goals directly
      setSavingsGoals(savRes.data || []);
      
      console.log("Data loaded successfully:", {
        incomes: incRes.data?.length,
        expenses: expRes.data?.length,
        savings: savRes.data?.length
      });
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setDataLoading(false);
    }
  };

  // ─────────────────────────────────────
  // CALCULATIONS (derived from real data)
  // ─────────────────────────────────────
  const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const balance = totalIncome - totalExpenses;

  const savingsAmount = expenses.find((e) => e.category === "savings")?.amount || 0;
  const savingsRate = totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0;

  const today = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  // Get payDay from user settings if available, default to 28
  const payDay = 28; // This should come from user settings later
  const daysToPayday = payDay >= today ? payDay - today : daysInMonth - today + payDay;
  const dailyBurnRate = totalExpenses / daysInMonth;
  const survivalDays = dailyBurnRate > 0 ? Math.floor(balance / dailyBurnRate) : 999;

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

  const handleLogout = async () => {
    await logout();
    // Clear all data on logout
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
  // LOADING SCREEN
  // ─────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading PesaPlan...</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────
  // DATA LOADING SCREEN (when fetching data)
  // ─────────────────────────────────────
  if (isAuthenticated && dataLoading && incomes.length === 0 && expenses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading your financial data...</p>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 transition-all duration-300">
        
        {/* Show NavBar only when authenticated */}
        {isAuthenticated && <NavBar />}

        {/* Main content with padding for navbar */}
        <main className={isAuthenticated ? "pt-16 pb-20" : ""}>
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>

        {/* Background decoration - subtle animated blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>
      </div>
    </AppContext.Provider>
  );
}

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppContext.Provider");
  }
  return context;
};
