import { useAuth } from "../context/AuthContext";
import { useApp } from "../App";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { id: "dashboard", icon: "🏠", iconActive: "🏠", label: "Home" },
  { id: "expenses", icon: "💸", iconActive: "💸", label: "Spend" },
  { id: "income", icon: "💰", iconActive: "💰", label: "Earn" },
  { id: "bills", icon: "📋", iconActive: "📋", label: "Bills" },  // Add this line
  { id: "savings", icon: "🎯", iconActive: "🎯", label: "Save" },
  { id: "budget", icon: "📋", iconActive: "📋", label: "Budget" },
  { id: "insights", icon: "📊", iconActive: "📊", label: "Insights" },
];

export default function NavBar() {
  const { user } = useAuth();
  const { page, setPage, darkMode, setDarkMode } = useApp();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfileMenu && !e.target.closest('.profile-menu')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu]);

  // Generate avatar initials from real user name
  const avatar = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <>
      {/* Top Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-lg" 
          : "bg-white/80 dark:bg-gray-950/80 backdrop-blur-md"
      } border-b border-gray-200/50 dark:border-gray-800/50`}>
        
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">P</span>
              </div>
              <div className="text-xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                Pesa<span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Plan</span>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {/* Affordability Tool Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage("afford")}
                className="relative group w-10 h-10 rounded-full flex items-center justify-center text-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                title="Can I Afford This?"
              >
                <span>💡</span>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Smart Check
                </div>
              </motion.button>

              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDarkMode(!darkMode)}
                className="relative group w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                title="Toggle theme"
              >
                <span className="text-lg">{darkMode ? "☀️" : "🌙"}</span>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {darkMode ? "Light mode" : "Dark mode"}
                </div>
              </motion.button>

              {/* Profile Button with Menu */}
              <div className="relative profile-menu">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-300 text-white dark:text-gray-900 font-bold text-sm flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300"
                  title="Profile"
                >
                  {avatar}
                </motion.button>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                            {avatar}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {user?.name || "User"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user?.email || "user@example.com"}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setPage("settings");
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <span className="mr-2">⚙️</span> Settings
                        </button>
                        
                        <button
                          onClick={() => {
                            // Trigger logout from settings page
                            setPage("settings");
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                        >
                          <span className="mr-2">🚪</span> Logout
                        </button>
                      </div>
                      
                      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
                        <div className="text-xs text-gray-500 text-center">
                          {getGreeting()}, {user?.name?.split(" ")[0] || "there"}! 👋
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        {/* Safe area spacer for iOS */}
        <div className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-around px-4 py-2">
            {navItems.map((item) => {
              const active = page === item.id;
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage(item.id)}
                  className="relative flex-1 flex flex-col items-center py-2 transition-all duration-300 group"
                >
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -top-2 w-12 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  
                  <div
                    className={`w-12 h-10 flex items-center justify-center text-xl rounded-xl transition-all duration-300 ${
                      active
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    }`}
                  >
                    {active ? item.iconActive : item.icon}
                  </div>
                  
                  <span
                    className={`text-xs font-medium transition-all duration-300 ${
                      active
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {item.label}
                  </span>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {item.label}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Spacer divs to prevent content from hiding under fixed navbars */}
      <div className="h-16" /> {/* Spacer for top navbar */}
      <div className="h-20" /> {/* Spacer for bottom navbar */}
    </>
  );
}
