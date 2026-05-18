import API from "../api/api";

export const expenseService = {
  // Get all expenses for the current user
  getAll: () => API.get("/expenses"),

  // Add a new expense
  // Frontend sends 'description', backend expects 'name'
  add: (data) =>
    API.post("/expenses", {
      name: data.description || data.name, // Map description to name
      amount: data.amount,
      category: data.category || null,
      type: data.type || null,
      date: data.date,
      note: data.note || null,
    }),

  // Delete an expense
  delete: (id) => API.delete(`/expenses/${id}`),

  // Update an existing expense
  update: (id, data) =>
    API.put(`/expenses/${id}`, {
      name: data.description || data.name,
      amount: data.amount,
      category: data.category,
      type: data.type,
      date: data.date,
      note: data.note || null,
    }),
};
