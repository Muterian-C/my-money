import { useState } from "react";
import { useAuth } from "../context/AuthContext";

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-6">
      <div className="w-full max-w-sm">

        {/* BRAND */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Pesa<span className="text-green-500">Plan</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Your money, finally making sense
          </p>
        </div>

        {/* CARD */}
        <div className="border rounded-2xl p-6 bg-white dark:bg-gray-950">

          {/* TABS */}
          <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl mb-6">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
                mode === "login"
                  ? "bg-white dark:bg-black shadow text-black dark:text-white"
                  : "text-gray-500"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
                mode === "signup"
                  ? "bg-white dark:bg-black shadow text-black dark:text-white"
                  : "text-gray-500"
              }`}
            >
              Create
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          {/* NAME (signup only) */}
          {mode === "signup" && (
            <div className="mb-4">
              <label className="text-xs text-gray-500">Full Name</label>
              <input
                className="w-full mt-1 p-3 border rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Amara Osei"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}

          {/* EMAIL */}
          <div className="mb-4">
            <label className="text-xs text-gray-500">Email</label>
            <input
              type="email"
              className="w-full mt-1 p-3 border rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-4">
            <label className="text-xs text-gray-500">Password</label>
            <input
              type="password"
              className="w-full mt-1 p-3 border rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={mode === "signup" ? "Create a strong password" : "Enter password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {/* PAYDAY (signup only) */}
          {mode === "signup" && (
            <div className="mb-5">
              <label className="text-xs text-gray-500">Payday (day of month)</label>
              <select
                className="w-full mt-1 p-3 border rounded-xl bg-transparent"
                value={form.payDay}
                onChange={(e) => setForm({ ...form, payDay: e.target.value })}
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}{d === 1 ? "st" : d === 2 ? "nd" : d === 3 ? "rd" : "th"} of every month
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* SUBMIT */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : mode === "login"
              ? "Sign In →"
              : "Create Account →"}
          </button>

          {/* DIVIDER */}
          <div className="flex items-center gap-3 my-5 text-xs text-gray-400">
            <div className="flex-1 border-t" />
            <span>or continue</span>
            <div className="flex-1 border-t" />
          </div>

          {/* DEMO */}
          <button
            onClick={onLogin}
            className="w-full border py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900 transition"
          >
            👀 View Demo (No sign-in)
          </button>

          {mode === "login" && (
            <p className="text-center text-xs text-gray-500 mt-4">
              Don't have an account?{" "}
              <span
                className="text-green-500 font-semibold cursor-pointer"
                onClick={() => setMode("signup")}
              >
                Sign up free
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}