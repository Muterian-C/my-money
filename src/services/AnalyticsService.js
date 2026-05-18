import API from "../api/api";

export const analyticsService = {
  // Get financial summary (income, expenses, balance)
  getSummary: () => API.get("/analytics/summary"),
  
  // Additional analytics endpoints (to be implemented in backend)
  // getSpendingTrends: () => API.get("/analytics/trends"),
  // getCategoryBreakdown: () => API.get("/analytics/categories"),
  // getMonthlyReport: (year, month) => API.get(`/analytics/monthly/${year}/${month}`),
};
