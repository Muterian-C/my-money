import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SEO from "../components/SEO";

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    "Expense Tracking",
    "Income Management",
    "Budget Planning",
    "Savings Goals",
    "Bill Manager",
    "Financial Health Score",
    "Affordability Tool",
    "Smart Insights",
    "Data Export (PDF)",
    "Dark Mode",
    "PWA Mobile App",
    "Email Support",
  ];

  return (
    <>
      <SEO 
        title="Pricing - 100% Free Forever"
        description="PesaPlan is completely free. No premium tiers, no hidden fees. Financial empowerment for every African."
        keywords="free budgeting app, no cost finance tracker, free expense manager, African finance free"
        type="website"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto px-4 py-12 pb-24">
          
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 rounded-full mb-4">
              <span>💰</span> 100% Free Forever
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-4">
              Simple Pricing
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              No hidden fees. No premium tiers. Just financial freedom.
            </p>
          </div>

          {/* Free Plan Card */}
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-2xl p-8 border-2 border-emerald-500 shadow-xl"
            >
              <div className="text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Free Forever</h2>
                <div className="mt-4 mb-6">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">KES 0</span>
                  <span className="text-gray-500"> / month</span>
                </div>
                <button
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  {isAuthenticated ? "Go to Dashboard →" : "Get Started →"}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-emerald-200 dark:border-emerald-800">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Everything you need:</p>
                <div className="grid grid-cols-2 gap-2">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-emerald-500">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Comparison Table */}
          <div className="mt-12 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-800/50">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-6">
              No Tricks. Just Transparency.
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Premium tiers</span>
                <span className="font-semibold text-emerald-600">❌ None - 100% free</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Hidden fees</span>
                <span className="font-semibold text-emerald-600">❌ No hidden costs</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Credit card required</span>
                <span className="font-semibold text-emerald-600">❌ Never</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Advertisements</span>
                <span className="font-semibold text-emerald-600">❌ No ads</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-600 dark:text-gray-400">Data export</span>
                <span className="font-semibold text-emerald-600">✅ Free PDF export</span>
              </div>
            </div>
          </div>

          {/* FAQ Teasers */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Have questions? Check out our <a href="#" className="text-emerald-600 hover:underline">FAQ</a> or <a href="#" className="text-emerald-600 hover:underline">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}