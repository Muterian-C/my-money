import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import GoogleLogin from '../components/GoogleLogin';

export default function AuthPage({ onLogin }) {
  const { login, register } = useAuth();

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    payDay: "28",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});

  const handleSubmit = async () => {
    setError("");

    if (!form.email || !form.password) {
      setError("Email and password required.");
      return;
    }

    if (mode === "signup" && !form.name) {
      setError("Name is required.");
      return;
    }

    setLoading(true);

    try {
      let result;

      if (mode === "login") {
        result = await login(form.email, form.password);
      } else {
        result = await register(form.name, form.email, form.password);
      }

      if (result.success) {
        onLogin();
      } else {
        setError(result.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-4 py-8">
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 dark:bg-green-900/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* BRAND - Enhanced with animation */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Pesa<span className="text-green-500 bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">Plan</span>
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
            Your money, finally making sense
          </p>
        </div>

        {/* CARD - Enhanced with glass morphism effect */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-8 transition-all duration-300 hover:shadow-xl">
          {/* TABS - Improved design */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-8">
            <button
              onClick={() => { setMode("login"); setError(""); setTouched({}); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                mode === "login"
                  ? "bg-white dark:bg-gray-900 shadow-md text-gray-900 dark:text-white transform scale-105"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); setTouched({}); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                mode === "signup"
                  ? "bg-white dark:bg-gray-900 shadow-md text-gray-900 dark:text-white transform scale-105"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* ERROR - Enhanced with icon and animation */}
          {error && (
            <div className="mb-6 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-3 rounded-xl animate-shake">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* NAME (signup only) - Enhanced with floating label effect */}
          {mode === "signup" && (
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  className="w-full p-3 border-2 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 dark:border-gray-700"
                  placeholder="e.g., Amara Osei"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onFocus={() => setTouched({ ...touched, name: true })}
                  onKeyPress={handleKeyPress}
                />
                {touched.name && form.name && (
                  <div className="absolute right-3 top-3 text-green-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EMAIL - Enhanced with icon */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="email"
                className="w-full p-3 pl-10 border-2 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 dark:border-gray-700"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>

          {/* PASSWORD - Enhanced with show/hide toggle */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-3 pl-10 pr-10 border-2 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 dark:border-gray-700"
                placeholder={mode === "signup" ? "Create a strong password" : "Enter your password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyPress={handleKeyPress}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* PAYDAY (signup only) - Enhanced with custom styling */}
          {mode === "signup" && (
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                Payday (Day of Month)
              </label>
              <div className="relative">
                <select
                  className="w-full p-3 border-2 rounded-xl bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 dark:border-gray-700 appearance-none"
                  value={form.payDay}
                  onChange={(e) => setForm({ ...form, payDay: e.target.value })}
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {d}{d === 1 ? "st" : d === 2 ? "nd" : d === 3 ? "rd" : "th"} of every month
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* SUBMIT - Enhanced with loading state */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing...</span>
              </div>
            ) : mode === "login" ? (
              "Sign In →"
            ) : (
              "Create Account →"
            )}
          </button>

          {/* DIVIDER - Enhanced style */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 border-t border-gray-200 dark:border-gray-800" />
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">or continue with</span>
            <div className="flex-1 border-t border-gray-200 dark:border-gray-800" />
          </div>

          {/* DEMO BUTTON - Enhanced with hover effect */}
          

{/* // In your AuthPage component, add this where you want the button: */}

<div className="relative my-4">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
  </div>
  <div className="relative flex justify-center text-sm">
    <span className="px-2 bg-white dark:bg-gray-950 text-gray-500">Or continue with</span>
  </div>
</div>

<GoogleLogin 
  onSuccess={(user) => {
    console.log('Google login success:', user);
    onLogin(); // Call your existing onLogin handler
  }}
  onError={(error) => {
    console.error('Google login error:', error);
    setError(error);
  }}
/>

          {/* SWITCH MODE LINK */}
          {mode === "login" && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              Don't have an account?{" "}
              <button
                className="text-green-500 font-semibold hover:text-green-600 hover:underline transition-all duration-200"
                onClick={() => setMode("signup")}
              >
                Create free account
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
