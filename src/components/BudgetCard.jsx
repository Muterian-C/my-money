import { motion } from "framer-motion";

export default function BudgetCard({ category, onEdit, onDelete }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "exceeded": return "bg-red-500";
      case "warning": return "bg-yellow-500";
      default: return "bg-emerald-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "exceeded": return "Exceeded";
      case "warning": return "Warning";
      default: return "On Track";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 hover:shadow-lg transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {category.category}
          </h3>
          {category.notes && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{category.notes}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(category)}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(category.id, category.category)}
            className="px-3 py-1 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Spent: {category.spent.toLocaleString()} KES
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            Budget: {category.budget.toLocaleString()} KES
          </span>
        </div>
        
        <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`absolute left-0 top-0 h-full transition-all duration-500 ${getStatusColor(category.status)}`}
            style={{ width: `${Math.min(category.percentage, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <span className={`text-sm font-semibold ${
            category.status === "exceeded" 
              ? "text-red-600" 
              : category.status === "warning" 
              ? "text-yellow-600" 
              : "text-emerald-600"
          }`}>
            {getStatusText(category.status)}
          </span>
          <span className="text-sm text-gray-500">
            {category.percentage}% used
          </span>
        </div>
        
        {category.remaining >= 0 ? (
          <p className="text-xs text-gray-500">
            Remaining: {category.remaining.toLocaleString()} KES
          </p>
        ) : (
          <p className="text-xs text-red-600">
            Over budget by: {Math.abs(category.remaining).toLocaleString()} KES
          </p>
        )}
      </div>
    </motion.div>
  );
}
