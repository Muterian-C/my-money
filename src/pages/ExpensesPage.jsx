export default function ExpensesPage() {
  const { expenses, setExpenses, totalExpenses } = useApp();

  const {
    pieData,
    fixedTotal,
    variableTotal,
  } = useExpenses(expenses);

  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");

  const filteredExpenses = expenses.filter((e) =>
    filter === "all"
      ? true
      : e.type === filter || e.category === filter
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black px-4 pb-24">

      {/* HEADER */}
      <div className="flex justify-between pt-5">
        <div>
          <h1 className="text-xl font-bold">Expenses</h1>
          <p className="text-xs text-gray-500">
            {expenses.length} transactions
          </p>
        </div>

        <div className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded-full">
          KES {totalExpenses.toLocaleString()}
        </div>
      </div>

      {/* ADD BUTTON */}
      <div className="mt-4">
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold"
        >
          + Add Expense
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 overflow-x-auto mt-3">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
              filter === f.id
                ? "bg-black text-white"
                : "bg-gray-200 dark:bg-gray-800"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="mt-4 space-y-3">
        {filteredExpenses.map((exp) => (
          <ExpenseItem key={exp.id} exp={exp} />
        ))}
      </div>

      {/* SUMMARY */}
      <div className="mt-6 p-4 border rounded-xl bg-white dark:bg-gray-900 text-sm">
        <div className="flex justify-between">
          <span>Fixed</span>
          <strong>{fmt(fixedTotal)}</strong>
        </div>
        <div className="flex justify-between mt-2">
          <span>Variable</span>
          <strong>{fmt(variableTotal)}</strong>
        </div>
      </div>
    </div>
  );
}