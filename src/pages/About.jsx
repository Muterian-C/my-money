import { useEffect } from "react";
import { motion } from "framer-motion";
import SEO from "../components/SEO";

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const team = [
    {
      name: "Muterian",
      role: "Founder & Developer",
      icon: "👨‍💻",
      bio: "Building financial tools for Africa",
    },
  ];

  const values = [
    {
      icon: "💚",
      title: "For Africa, By Africans",
      description: "Built specifically for African financial realities - HELB, Black Tax, SACCOs, and more.",
    },
    {
      icon: "🔓",
      title: "100% Free Forever",
      description: "No premium tiers, no hidden fees. Financial empowerment should be accessible to everyone.",
    },
    {
      icon: "🛡️",
      title: "Privacy First",
      description: "Your data stays yours. We never sell or share your financial information.",
    },
    {
      icon: "📈",
      title: "Financial Freedom",
      description: "Empowering Africans to take control of their money and build better futures.",
    },
  ];

  return (
    <>
      <SEO 
        title="About Us - Our Mission to Empower African Financial Freedom"
        description="Learn about PesaPlan's mission to help Africans take control of their finances. Built by Africans, for Africans. 100% free forever."
        keywords="about PesaPlan, financial freedom Africa, money management mission, African fintech, financial inclusion"
        type="website"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto px-4 py-12 pb-24">
          
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 rounded-full mb-4">
              <span>🌍</span> Our Story
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-4">
              About PesaPlan
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We're on a mission to help every African take control of their financial future.
            </p>
          </div>

          {/* Mission Section */}
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-800/50 shadow-lg mb-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🎯</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-center">
              To empower every African with the tools and knowledge to achieve financial freedom. 
              We believe that managing money shouldn't be complicated or expensive. 
              PesaPlan is designed to be simple, effective, and completely free for everyone.
            </p>
          </div>

          {/* The Problem Section */}
          <div className="bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20 rounded-2xl p-8 border border-rose-200 dark:border-rose-800 mb-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">😔</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">The Problem</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-center">
              Many Africans struggle to make their money last the month. Between rent, HELB loans, 
              black tax, and daily expenses, it's easy to lose track. Most budgeting apps are built 
              for Western markets and don't understand African financial realities.
            </p>
          </div>

          {/* Our Solution */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-2xl p-8 border border-emerald-200 dark:border-emerald-800 mb-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">💡</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Solution</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-center">
              PesaPlan is built specifically for African financial realities. Track your survival days, 
              manage HELB payments, budget for black tax, and get real insights about your spending. 
              All in one place, completely free.
            </p>
          </div>

          {/* Our Values */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50 hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-3">{value.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{value.description}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl p-8 border border-emerald-200/50 dark:border-emerald-800/30">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Ready to take control?
            </h3>
            <button
              onClick={() => window.location.href = '/auth'}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Start Your Journey →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
