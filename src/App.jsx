import { useState, useEffect } from "react";
import Footer from "./components/Footer";
import { useAuth } from "./context/AuthContext";
import { AppContext } from "./context/AppContext"; // ✅ imported from its own file

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ExpensesPage from "./pages/ExpensesPage";
import IncomePage from "./pages/IncomePage";
import SavingsPage from "./pages/SavingsPage";
import InsightsPage from "./pages/InsightsPage";
import SettingsPage from "./pages/SettingsPage";
import AffordabilityTool from "./pages/AffordabilityTool";
import BudgetPage from "./pages/BudgetPage";
import NavBar from "./components/NavBar";
import BillsPage from "./pages/BillsPage";
import GoogleCallback from "./pages/GoogleCallback";

import { incomeService } from "./services/incomeService";
import { expenseService } from "./services/expenseService";
import { savingsService } from "./services/savingsService";

// Valid pages a logged-in user can be on
const VALID_APP_PAGES = [
  "dashboard", "expenses", "income",
  "savings", "bills", "insights", "afford", "settings",
  "budget", "google-callback", "about", "features", "pricing",
];

export default function App() {
  const { isAuthenticated, loading: authLoading, logout, user: authUser, setUser } = useAuth();

  const [page, setPage] = useState("dashboard");

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

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
    if (VALID_APP_PAGES.includes(page)) {
      localStorage.setItem("lastPage", page);
    }
  }, [page]);

  // ─────────────────────────────────────
  // HANDLE GOOGLE OAUTH CALLBACK URL
  // ─────────────────────────────────────
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/auth/google/success') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');

      if (token) {
        localStorage.setItem('token', token);
        window.history.replaceState({}, document.title, '/');
        window.location.reload();
      } else if (error) {
        window.history.replaceState({}, document.title, '/');
        setPage('auth');
      } else {
        window.history.replaceState({}, document.title, '/');
        setPage('auth');
      }
    }
  }, []);

  // ─────────────────────────────────────
  // HANDLE AUTHENTICATION STATE
  // ─────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;

    setInitialAuthCheckDone(true);

    if (isAuthenticated) {
      const savedPage = localStorage.getItem("lastPage");
      const restoredPage =
        savedPage && VALID_APP_PAGES.includes(savedPage)
          ? savedPage
          : "dashboard";
      setPage(restoredPage);
      fetchAllData();
    } else {
      setPage((prev) => (prev === "auth" ? "auth" : "landing"));
      localStorage.removeItem("lastPage");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      setIncomes(incRes.data || []);
      setExpenses(
        (expRes.data || []).map((exp) => ({
          ...exp,
          description: exp.name,
        }))
      );
      setSavingsGoals(savRes.data || []);

      console.log("Data loaded:", {
        incomes: incRes.data?.length,
        expenses: expRes.data?.length,
        savings: savRes.data?.length,
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

  const savingsAmount =
    expenses.find((e) => e.category === "savings")?.amount || 0;
  const savingsRate =
    totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0;

  const today = new Date().getDate();
  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();
  const payDay = authUser?.pay_day || 28;
  const daysToPayday =
    payDay >= today ? payDay - today : daysInMonth - today + payDay;
  const dailyBurnRate = daysInMonth > 0 ? totalExpenses / daysInMonth : 0;
  const survivalDays =
    dailyBurnRate > 0 ? Math.floor(balance / dailyBurnRate) : 999;

  const healthScore = Math.min(
    100,
    Math.max(
      0,
      (balance > 0 ? 30 : 0) +
        (savingsRate >= 20 ? 25 : savingsRate >= 10 ? 15 : 5) +
        (survivalDays >= 15 ? 25 : survivalDays >= 7 ? 15 : 5) +
        (totalIncome > 0 && totalExpenses / totalIncome < 0.8
          ? 20
          : totalIncome > 0 && totalExpenses / totalIncome < 0.95
          ? 10
          : 0)
    )
  );

  // ─────────────────────────────────────
  // AUTH HANDLERS
  // ─────────────────────────────────────
  const handleLogin = () => {};

  const handleLogout = async () => {
    await logout();
    setIncomes([]);
    setExpenses([]);
    setSavingsGoals([]);
    setPage("landing");
    localStorage.removeItem("lastPage");
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
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
    user: authUser,
    updateUser: handleUpdateUser,
  };

  // ─────────────────────────────────────
  // LOADING SCREEN
  // ─────────────────────────────────────
  if (authLoading || !initialAuthCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading PesaPlan...
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────
  // PAGE RENDERING
  // ─────────────────────────────────────
  const renderPage = () => {
    if (page === "google-callback") {
      return <GoogleCallback />;
    }

    if (!isAuthenticated) {
      if (page === "auth") {
        return <AuthPage onLogin={handleLogin} />;
      }
      return <LandingPage onGetStarted={() => setPage("auth")} />;
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
      case "bills":
        return <BillsPage />;
      case "afford":
        return <AffordabilityTool />;
      case "budget":
        return <BudgetPage />;
      case "settings":
        return <SettingsPage onLogout={handleLogout} />;
      default:
        return <Dashboard />;
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

        <Footer />

        {/* Animated background blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </div>
    </AppContext.Provider>
  );
}
