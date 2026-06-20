import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AppContext } from "./context/AppContext";

// Layout Components
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

// Page Components
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
import BillsPage from "./pages/BillsPage";
import GoogleCallback from "./pages/GoogleCallback";
import About from "./pages/About";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";

import { incomeService } from "./services/incomeService";
import { expenseService } from "./services/expenseService";
import { savingsService } from "./services/savingsService";

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) return null;
  return isAuthenticated ? children : null;
}

export default function App() {
  const { isAuthenticated, loading: authLoading, logout, user: authUser, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
  // HANDLE GOOGLE OAUTH CALLBACK URL
  // ─────────────────────────────────────
//  useEffect(() => {
//    const path = location.pathname;
//    if (path === '/auth/google/success') {
//      const urlParams = new URLSearchParams(window.location.search);
//      const token = urlParams.get('token');
//      const error = urlParams.get('error');
//
//      if (token) {
//        localStorage.setItem('token', token);
//        window.history.replaceState({}, document.title, '/');
//        window.location.reload();
//      } else if (error) {
//        navigate('/auth');
//      } else {
//        navigate('/auth');
//      }
//    }
//  }, [location, navigate]);

  // ─────────────────────────────────────
  // INITIAL AUTH CHECK & DATA FETCH
  // ─────────────────────────────────────
  useEffect(() => {
    if (!authLoading) {
      setInitialAuthCheckDone(true);
      if (isAuthenticated) {
        fetchAllData();
      }
    }
  }, [authLoading, isAuthenticated]);

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

  const savingsAmount = expenses.find((e) => e.category === "savings")?.amount || 0;
  const savingsRate = totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0;

  const today = new Date().getDate();
  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();
  const payDay = authUser?.pay_day || 28;
  const daysToPayday = payDay >= today ? payDay - today : daysInMonth - today + payDay;
  const dailyBurnRate = daysInMonth > 0 ? totalExpenses / daysInMonth : 0;
  const survivalDays = dailyBurnRate > 0 ? Math.floor(balance / dailyBurnRate) : 999;

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
  const handleLogout = async () => {
    await logout();
    setIncomes([]);
    setExpenses([]);
    setSavingsGoals([]);
    navigate('/');
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  // ─────────────────────────────────────
  // CONTEXT VALUE
  // ─────────────────────────────────────
  const ctx = {
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
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading PesaPlan...</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────
  // SHOULD SHOW NAVBAR & FOOTER
  // ─────────────────────────────────────
  const publicPages = ['/', '/auth', '/about', '/features', '/pricing'];
  const isPublicPage = publicPages.includes(location.pathname);
  const showNavbar = isAuthenticated || (isPublicPage && location.pathname !== '/auth');
  const showFooter = true; // Show footer everywhere

  return (
    <AppContext.Provider value={ctx}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 transition-all duration-300">
        {showNavbar && <NavBar />}

        <main className={(isAuthenticated || location.pathname === '/dashboard') ? "pt-16 pb-20" : ""}>
          <div className="max-w-7xl mx-auto">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/auth/google/success" element={<GoogleCallback />} />

              {/* Protected Routes (require authentication) */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/expenses" element={
                <ProtectedRoute>
                  <ExpensesPage />
                </ProtectedRoute>
              } />
              <Route path="/income" element={
                <ProtectedRoute>
                  <IncomePage />
                </ProtectedRoute>
              } />
              <Route path="/savings" element={
                <ProtectedRoute>
                  <SavingsPage />
                </ProtectedRoute>
              } />
              <Route path="/insights" element={
                <ProtectedRoute>
                  <InsightsPage />
                </ProtectedRoute>
              } />
              <Route path="/bills" element={
                <ProtectedRoute>
                  <BillsPage />
                </ProtectedRoute>
              } />
              <Route path="/afford" element={
                <ProtectedRoute>
                  <AffordabilityTool />
                </ProtectedRoute>
              } />
              <Route path="/budget" element={
                <ProtectedRoute>
                  <BudgetPage />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage onLogout={handleLogout} />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </main>

        {showFooter && <Footer />}

        {/* Animated background blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </div>
    </AppContext.Provider>
  );
}
