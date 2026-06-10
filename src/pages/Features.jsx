import { useEffect } from "react";
import { motion } from "framer-motion";
import SEO from "../components/SEO";

export default function Features() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: "📊",
      title: "Survival Days Counter",
      description: "Know exactly how many days your money will last before your next paycheck.",
      color: "from-blue-500 to-blue-600",
      bg: "from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-950/30",
    },
    {
      icon: "🚨",
      title: "Overspending Alerts",
      description: "Get notified before you exceed your budget on any category.",
      color: "from-rose-500 to-rose-600",
      bg: "from-rose-50 to-rose-100 dark:from-rose-950/20 dark:to-rose-950/30",
    },
    {
      icon: "🎯",
      title: "Savings Goals",
      description: "Track your progress towards emergency funds, travel, gadgets, and more.",
      color: "from-emerald-500 to-emerald-600",
      bg: "from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-950/30",
    },
    {
      icon: "💡",
      title: "Can I Afford This?",
      description: "See the real-time impact of any purchase on your budget.",
      color: "from-amber-500 to-amber-600",
      bg: "from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-950/30",
    },
    {
      icon: "📈",
      title: "Financial Health Score",
      description: "A clear score showing your financial stability at a glance.",
      color: "from-purple-500 to-purple-600",
      bg: "from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-950/30",
    },
    {
      icon: "📋",
      title: "Bill Manager",
      description: "Never miss a payment with our bill tracking and reminders.",
      color: "from-indigo-500 to-indigo-600",
      bg: "from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-950/30",
    },
    {
      icon: "💰",
      title: "Budget Planning",
      description: "Set spending limits by category and track your progress.",
      color: "from-teal-500 to-teal-600",
      bg: "from-teal-50 to-teal-100 dark:from-teal-950/20 dark:to-teal-950/30",
    },
    {
      icon: "🎓",
      title: "HELB Tracker",
      description: "Special category for Kenyan students managing HELB loans.",
      color: "from-red-500 to-red-600",
      bg: "from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-950/30",
    },
    {
      icon: "👨‍👩‍👧",
      title: "Black Tax Budgeting",
      description: "Budget specifically for family support obligations.",
      color: "from-purple-500 to-purple-600",
      bg: "from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-950/30",
    },
  ];

  return (
    <>
      <SEO 
        title="Features - Smart Financial Tools for Africans"
        description="Explore PesaPlan's powerful features: expense tracking, budget management, savings goals, bill reminders, and financial health score. All free."
        keywords="budgeting features, expense tracker features, savings goals, bill reminders, financial health score, African finance tools"
        type="website"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="max-w-6xl mx-auto px-4 py-12 pb-24">
          
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-400 rounded-full mb-4">
              <span>⚡</span> Powerful Features
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-4">
              Everything You Need
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Designed specifically for African financial realities. Completely free.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-gradient-to-br ${feature.bg} rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 hover:shadow-xl transition-all hover:scale-105`}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Comparison Section */}
          <div className="mt-12 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-800/50">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
              Why Choose PesaPlan?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-3">✓ What Makes Us Different</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">✓ Built for African financial realities</li>
                  <li className="flex items-center gap-2">✓ 100% free - no premium tiers</li>
                  <li className="flex items-center gap-2">✓ HELB and Black Tax categories</li>
                  <li className="flex items-center gap-2">✓ Survival days counter</li>
                  <li className="flex items-center gap-2">✓ Offline support with PWA</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-3">✓ What You Get</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">✓ Expense and income tracking</li>
                  <li className="flex items-center gap-2">✓ Budget planning and alerts</li>
                  <li className="flex items-center gap-2">✓ Savings goals with progress</li>
                  <li className="flex items-center gap-2">✓ Bill reminders and payments</li>
                  <li className="flex items-center gap-2">✓ Financial health score</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <button
              onClick={() => window.location.href = '/auth'}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Start Using PesaPlan Free →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
