import API from "../api/api";

export const budgetService = {
  // Get all budgets for a specific month/year
  getBudgets: async (month, year) => {
    const response = await API.get(`/budgets?month=${month}&year=${year}`);
    return response.data;
  },

  // Create a new budget
  createBudget: async (budgetData) => {
    const response = await API.post("/budgets", budgetData);
    return response.data;
  },

  // Update an existing budget
  updateBudget: async (id, budgetData) => {
    const response = await API.put(`/budgets/${id}`, budgetData);
    return response.data;
  },

  // Delete a budget
  deleteBudget: async (id) => {
    const response = await API.delete(`/budgets/${id}`);
    return response.data;
  },

  // Get budget summary with actual spending
  getBudgetSummary: async (month, year) => {
    const response = await API.get(`/budgets/summary?month=${month}&year=${year}`);
    return response.data;
  },

  // Get budget comparison across months
  getBudgetComparison: async (months = 6) => {
    const response = await API.get(`/budgets/compare?months=${months}`);
    return response.data;
  },

  // Get budget alerts
  getBudgetAlerts: async (unreadOnly = false) => {
    const response = await API.get(`/budgets/alerts?unread=${unreadOnly}`);
    return response.data;
  },

  // Get available categories
  getCategories: async () => {
    const response = await API.get("/budgets/categories");
    return response.data;
  },
};
