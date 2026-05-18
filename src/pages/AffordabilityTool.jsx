import { useState, useEffect } from "react";
import { useApp } from "../App";

export default function AffordabilityTool() {
  const [amount, setAmount] = useState("");
  const [showInsight, setShowInsight] = useState(false);
  const [impact, setImpact] = useState(null);
  const [animatedRemaining, setAnimatedRemaining] = useState(0);
  const { balance, totalIncome, totalExpenses, savingsRate, survivalDays, dailyBurnRate } = useApp();

  const numericAmount = Number(amount) || 0;
  const remaining = balance - numericAmount;
  const isAffordable = numericAmount <= balance;
  const spendingImpact = (numericAmount / totalIncome) * 100;
  const daysImpact = Math.floor(numericAmount / dailyBurnRate);
  const savingsImpact = (numericAmount / (balance || 1)) * 100;

  // Animate remaining balance
  useEffect(() => {
    const duration = 500;
    const steps = 30;
    const stepTime = duration / steps;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      setAnimatedRemaining(Math.min(remaining, remaining * progress));
      if (step >= steps) {
        setAnimatedRemaining(remaining);
        clearInterval(interval);
      }
    }, stepTime);
    return () => clearInterval(interval);
  }, [remaining]);

  // Show impact analysis after delay
  useEffect(() => {
    if (numericAmount > 0) {
      const timer = setTimeout(() => {
        setShowInsight(true);
        setImpact({
          spendingImpact,
          daysImpact,
          savingsImpact,
          isAffordable
        });
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShowInsight(false);
    }
  }, [numericAmount, spendingImpact, daysImpact, savingsImpact, isAffordable]);

  const handlePresetClick = (presetAmount) => {
    setAmount(presetAmount.toString());
    setShowInsight(false);
  };

  const getAffordabilityStatus = () => {
    if (!numericAmount) return null;
    if (numericAmount <= balance * 0.1) return { text: "Easily Affordable", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", icon: "✅", advice: "Go for it! This won't impact your financial goals." };
    if (numericAmount <= balance * 0.3) return { text: "Consider Carefully", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30", icon: "⚠️", advice: "Make sure this aligns with your priorities this month." };
    if (numericAmount <= balance) return { text: "Affordable but Significant", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30", icon: "💭", advice: "This will impact your savings goals. Consider waiting?" };
    return { text: "Not Affordable", color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/30", icon: "🚫", advice: "This would put you in the red. Try to save up first!" };
  };

  const status = getAffordabilityStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-400 rounded-full mb-4">
            <span>💡</span> Smart Spending Assistant
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-3">
            Can I Afford This?
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Make confident spending decisions with real-time impact analysis
          </p>
        </div>

        {/* Balance Overview Card */}
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Current Balance</div>
            <div className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full font-semibold">
              💰 Available
            </div>
          </div>
          <div className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            KES {balance.toLocaleString()}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div>
              <div className="text-xs text-gray-500">Daily Budget</div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">KES {Math.round(dailyBurnRate).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Survival Days</div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{survivalDays} days</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Savings Rate</div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{savingsRate.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-lg mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Purchase Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">KES</span>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-16 pr-4 py-4 text-2xl font-bold bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-all text-gray-900 dark:text-white"
              autoFocus
            />
          </div>
          
          {/* Quick Presets */}
          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-2">Quick presets:</div>
            <div className="flex gap-2 flex-wrap">
              {[500, 1000, 2000, 5000, 10000].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetClick(preset)}
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all hover:scale-105"
                >
                  KES {preset.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Impact Analysis */}
        {numericAmount > 0 && (
          <div className="space-y-4 animate-fade-in">
            {/* Affordability Status Card */}
            {status && (
              <div className={`${status.bg} rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-lg transform transition-all duration-300 hover:scale-[1.02]`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">{status.icon}</div>
                  <div className={`text-xl font-bold ${status.color}`}>{status.text}</div>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{status.advice}</p>
              </div>
            )}

            {/* New Balance Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl">
              <div className="text-xs text-gray-300 mb-1">New Balance After Purchase</div>
              <div className="text-4xl font-bold mb-2">
                KES {Math.max(0, Math.round(animatedRemaining)).toLocaleString()}
              </div>
              {!isAffordable && numericAmount > 0 && (
                <div className="text-rose-300 text-sm mt-2 flex items-center gap-2">
                  <span>⚠️</span> This would exceed your available balance by KES {Math.abs(remaining).toLocaleString()}
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Balance after purchase:</span>
                  <span className={remaining >= 0 ? "text-emerald-400" : "text-rose-400"}>
                    {remaining >= 0 ? "Positive" : "Negative"}
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Impact Analysis */}
            {showInsight && impact && (
              <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-lg animate-slide-up">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>📊</span> How this affects your finances
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Impact on monthly income</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">{spendingImpact.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Days of spending</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{daysImpact} days</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Impact on current savings</span>
                    <span className={`font-semibold ${savingsImpact > 50 ? 'text-rose-600' : 'text-emerald-600'} dark:${savingsImpact > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {savingsImpact.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Opportunity Cost */}
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl">
                  <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold mb-1">💭 Opportunity Cost</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    This amount could cover {Math.floor(numericAmount / 500)} day(s) of transport or {Math.floor(numericAmount / 2000)} grocery shopping trips.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!numericAmount && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤔</div>
            <p className="text-gray-500 dark:text-gray-400">Enter an amount to see if you can afford it</p>
            <p className="text-xs text-gray-400 mt-2">We'll analyze the impact on your budget</p>
          </div>
        )}

        {/* Pro Tip Card */}
        <div className="mt-8 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl p-5 border border-emerald-200/50 dark:border-emerald-800/30">
          <div className="flex gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Pro Tip</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Wait 24 hours before making purchases over 10% of your balance. This cooling-off period helps avoid impulse buying and gives you time to evaluate if it's truly necessary.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
