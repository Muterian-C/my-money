import { useApp } from "../App";
import { useAuth } from "../context/AuthContext";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const fmt = (n) => `KES ${n.toLocaleString()}`;

const CATEGORY_COLORS = {
  rent: "bg-indigo-500",
  transport: "bg-amber-500",
  food: "bg-green-500",
  internet: "bg-blue-500",
  helb: "bg-red-500",
  blacktax: "bg-purple-500",
  savings: "bg-emerald-500",
  utilities: "bg-orange-500",
  emergencies: "bg-pink-500",
};

const CATEGORY_LABELS = {
  rent: "Rent",
  transport: "Transport",
  food: "Food",
  internet: "Internet",
  helb: "HELB",
  blacktax: "Black Tax",
  savings: "Savings",
  utilities: "Utilities",
  emergencies: "Emergency",
};

export default function Dashboard() {
  const { user } = useAuth();
  const {
    expenses,
    totalIncome,
    totalExpenses,
    balance,
    savingsRate,
    daysToPayday,
    survivalDays,
    healthScore,
    dailyBurnRate,
  } = useApp();

  // -------- DERIVED DATA (clean separation) --------
  const expenseByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const pieData = Object.entries(expenseByCategory).map(([k, v]) => ({
    name: CATEGORY_LABELS[k] || k,
    value: v,
    color: CATEGORY_COLORS[k]?.replace("bg-", "") || "#888",
  }));

  const spendingRatio =
    totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  const emergencyFund =
    (expenseByCategory.savings || 0) * 3;

  const healthColor =
    healthScore >= 70
      ? "text-green-500"
      : healthScore >= 45
      ? "text-amber-500"
      : "text-red-500";

  const healthLabel =
    healthScore >= 70
      ? "Healthy"
      : healthScore >= 45
      ? "At Risk"
      : "Danger";

  const alerts = [];
  if (survivalDays < 10)
    alerts.push({
      type: "danger",
      msg: `You may run out of money in ${survivalDays} days.`,
    });

  if (spendingRatio > 90)
    alerts.push({
      type: "danger",
      msg: `Spending at ${Math.round(spendingRatio)}% — critical.`,
    });

  if (savingsRate < 10)
    alerts.push({
      type: "warn",
      msg: `Savings rate is ${savingsRate.toFixed(1)}% (low).`,
    });

  const monthlyTrend = [
    { month: "Feb", income: 52000, expenses: 41000 },
    { month: "Mar", income: 55000, expenses: 46000 },
    { month: "Apr", income: 57000, expenses: 44000 },
    { month: "May", income: totalIncome, expenses: totalExpenses },
  ];

  // -------- UI --------
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white px-4 pb-24">

      {/* HEADER */}
      <div className="flex justify-between items-start pt-5">
        <div>
          <h1 className="text-xl font-bold">
            Hey, {user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-xs text-gray-500">
            Your financial snapshot
          </p>
        </div>

        <div className="text-xs px-3 py-1 bg-green-100 text-green-600 rounded-full">
          💰 {daysToPayday}d to payday
        </div>
      </div>

      {/* BALANCE CARD */}
      <div className="mt-4 bg-black text-white p-5 rounded-2xl relative overflow-hidden">
        <div className="text-xs opacity-60 uppercase">
          Remaining Balance
        </div>

        <div className="text-3xl font-bold mt-1">
          {fmt(balance)}
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 text-xs">
          <div>
            <div className="opacity-50">Income</div>
            <div className="font-semibold">+{fmt(totalIncome)}</div>
          </div>

          <div>
            <div className="opacity-50">Spent</div>
            <div className="font-semibold text-red-400">
              -{fmt(totalExpenses)}
            </div>
          </div>

          <div>
            <div className="opacity-50">Daily</div>
            <div className="font-semibold">
              {fmt(Math.round(dailyBurnRate))}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <Stat label="Survival Days" value={`${survivalDays}d`} />
        <Stat label="Savings Rate" value={`${savingsRate.toFixed(1)}%`} />
        <Stat label="Emergency Fund" value={`3 months`} />
        <Stat label="Spending" value={`${Math.round(spendingRatio)}%`} />
      </div>

      {/* HEALTH */}
      <div className="mt-4 p-4 border rounded-2xl bg-white dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <div className={`text-2xl font-bold ${healthColor}`}>
            {healthScore}
          </div>

          <div>
            <div className="font-semibold">
              Financial Health: {healthLabel}
            </div>
            <div className="text-xs text-gray-500">
              Based on spending + savings + balance
            </div>
          </div>
        </div>
      </div>

      {/* ALERTS */}
      {alerts.length > 0 && (
        <div className="mt-4 space-y-2">
          {alerts.map((a, i) => (
            <div
              key={i}
              className="text-xs p-2 rounded-lg bg-red-50 text-red-600"
            >
              ⚠️ {a.msg}
            </div>
          ))}
        </div>
      )}

      {/* PIE CHART */}
      <Section title="Spending Breakdown">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={70}>
                {pieData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Section>

      {/* BAR CHART */}
      <Section title="Monthly Trend">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrend}>
              <XAxis dataKey="month" />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="income" fill="#22c55e" />
              <Bar dataKey="expenses" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      {/* TOP SPENDING */}
      <Section title="Top Categories">
        <div className="space-y-2">
          {pieData
            .sort((a, b) => b.value - a.value)
            .map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <div className="flex-1">{item.name}</div>
                <div>{Math.round((item.value / totalExpenses) * 100)}%</div>
              </div>
            ))}
        </div>
      </Section>
    </div>
  );
}

/* ---------- SMALL REUSABLE COMPONENTS ---------- */

function Stat({ label, value }) {
  return (
    <div className="p-3 border rounded-xl bg-white dark:bg-gray-900">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mt-5">
      <h2 className="text-sm font-bold mb-2">{title}</h2>
      <div className="p-3 border rounded-xl bg-white dark:bg-gray-900">
        {children}
      </div>
    </div>
  );
}
