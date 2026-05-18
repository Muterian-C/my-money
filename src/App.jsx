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

  const [page, setPage] = useState(() => {
    // Try to restore last page from localStorage
    const savedPage = localStorage.getItem("lastPage");
    return savedPage && savedPage !== "landing" && savedPage !== "auth" ? savedPage : "dashboard";
  });
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  // Real data from backend
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [initialAuthCheckDone, setInitialAuthCheckDone] = useState(false);

  // ─────────────────────────────────────
  // DARK MODE PERSISTENCE
  // ─────────────────────────────────────
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // ─────────────────────────────────────
  // SAVE LAST PAGE TO LOCALSTORAGE
  // ─────────────────────────────────────
  useEffect(() => {
    if (page && page !== "landing" && page !== "auth") {
      localStorage.setItem("lastPage", page);
    }
  }, [page]);

  // ─────────────────────────────────────
  // HANDLE AUTHENTICATION STATE
  // ─────────────────────────────────────
  useEffect(() => {
    // Wait for auth to finish loading before deciding where to go
    if (!authLoading) {
      setInitialAuthCheckDone(true);
      
      if (isAuthenticated) {
        // User is logged in, show dashboard
        if (page === "landing" || page === "auth") {
          setPage("dashboard");
        }
        fetchAllData();
      } else {
        // User is not logged in, only show landing/auth
        if (page !== "landing" && page !== "auth") {
          setPage("landing");
        }
      }
    }
  }, [isAuthenticated, authLoading]);

  // ─────────────────────────────────────
  // FETCH ALL DATA FROM BACKEND
  // ─────────────────────────────────────
  const fetchAllData = async () => {
    if (!isAuthenticated) return;
    
    setDataLoading(true);
    try {
      const [incRes, expRes, savRes] = await Promise.all([
        incomeService.getAll(),
        expenseService.getAll(),
        savingsService.getAll(),
      ]);
      
      setIncomes(incRes.data || []);
      setExpenses((expRes.data || []).map(exp => ({
        ...exp,
        description: exp.name
      })));
      setSavingsGoals(savRes.data || []);
      
      console.log("Data loaded:", {
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
  // CALCULATIONS
  // ─────────────────────────────────────
  const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const balance = totalIncome - totalExpenses;

  const savingsAmount = expenses.find((e) => e.category === "savings")?.amount || 0;
  const savingsRate = totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0;

  const today = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const payDay = 28;
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
        (totalExpenses / totalIncome < 0.8 ? 20 : totalExpenses / totalIncome < 0.95 ? 10 : 0)
    )
  );

  // ─────────────────────────────────────
  // AUTH HANDLERS
  // ─────────────────────────────────────
  const handleLogin = () => {
    // Auth state will trigger the useEffect above
  };

  const handleLogout = async () => {
    await logout();
    setIncomes([]);
    setExpenses([]);
    setSavingsGoals([]);
    setPage("landing");
    localStorage.removeItem("lastPage");
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
  // SHOW LOADING SCREEN WHILE CHECKING AUTH
  // This prevents the flash of landing page!
  // ─────────────────────────────────────
  if (authLoading || !initialAuthCheckDone) {
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
        
        {isAuthenticated && <NavBar />}

        <main className={isAuthenticated ? "pt-16 pb-20" : ""}>
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>

        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </div>
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppContext.Provider");
  }
  return context;
};
