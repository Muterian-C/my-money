export default function LandingPage({ onGetStarted }) {
  const features = [
    {
      icon: "📊",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      title: "Survival Days Counter",
      desc: "Know exactly how many days your money lasts before payday.",
    },
    {
      icon: "🚨",
      bg: "bg-red-100 dark:bg-red-900/30",
      title: "Overspending Alerts",
      desc: "Get warned before you overspend on essentials or obligations.",
    },
    {
      icon: "🎯",
      bg: "bg-green-100 dark:bg-green-900/30",
      title: "Savings Goals",
      desc: "Track emergency funds, travel, gadgets and more.",
    },
    {
      icon: "💡",
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      title: "Can I Afford This?",
      desc: "Instantly see the impact of purchases on your budget.",
    },
    {
      icon: "📈",
      bg: "bg-purple-100 dark:bg-purple-900/30",
      title: "Financial Health Score",
      desc: "A clear score showing your financial stability this month.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">

      {/* HERO */}
      <section className="max-w-md mx-auto px-6 pt-16 pb-10 text-center">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 rounded-full mb-6">
          🇰🇪 Built for African Professionals
        </div>

        <h1 className="text-4xl font-bold leading-tight tracking-tight">
          Don’t run out <br />
          of money <span className="text-green-500">again.</span>
        </h1>

        <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
          PesaPlan helps interns, grads, freelancers and low-income earners manage
          rent, HELB, black tax and daily spending — so your money lasts the whole month.
        </p>

        {/* CTA */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={onGetStarted}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition"
          >
            Start for Free →
          </button>

          <button
            onClick={onGetStarted}
            className="w-full border border-gray-300 dark:border-gray-700 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900 transition"
          >
            See Demo Dashboard
          </button>

          <p className="text-xs text-gray-500">
            No credit card. No nonsense. Just control.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-md mx-auto px-6 grid grid-cols-3 gap-2 text-center">
        <div className="p-3 border rounded-xl">
          <div className="text-lg font-bold text-green-500">87%</div>
          <div className="text-[10px] text-gray-500">avoid panic</div>
        </div>

        <div className="p-3 border rounded-xl">
          <div className="text-lg font-bold">4.2K</div>
          <div className="text-[10px] text-gray-500">users</div>
        </div>

        <div className="p-3 border rounded-xl">
          <div className="text-lg font-bold text-blue-500">KES 0</div>
          <div className="text-[10px] text-gray-500">cost</div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-md mx-auto px-6 mt-8 space-y-3">
        {features.map((f, i) => (
          <div
            key={i}
            className="flex gap-4 p-4 border rounded-xl bg-white dark:bg-gray-950 hover:scale-[1.01] transition"
          >
            <div className={`w-11 h-11 flex items-center justify-center rounded-xl text-xl ${f.bg}`}>
              {f.icon}
            </div>

            <div>
              <h3 className="font-semibold text-sm">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed mt-1">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* TESTIMONIAL */}
      <section className="max-w-md mx-auto px-6 mt-10">
        <div className="p-5 border rounded-xl bg-gray-50 dark:bg-gray-900">
          <p className="italic text-sm text-gray-700 dark:text-gray-300">
            “PesaPlan helped me realize I was wasting 40% of my salary on transport and food.”
          </p>
          <div className="mt-3 text-xs font-semibold text-gray-500">
            — Brian M., Nairobi 🧑‍💻
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-md mx-auto px-6 my-10">
        <div className="p-6 bg-green-500 text-white rounded-2xl text-center">
          <h3 className="text-lg font-bold">Your money. Your future.</h3>
          <p className="text-sm opacity-80 mt-1">
            Join Africans taking control of their finances.
          </p>

          <button
            onClick={onGetStarted}
            className="mt-4 w-full bg-white text-green-600 font-semibold py-3 rounded-xl"
          >
            Create Free Account →
          </button>
        </div>
      </section>

    </div>
  );
}