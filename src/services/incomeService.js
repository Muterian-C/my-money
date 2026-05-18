import API from "../api/api";

export const incomeService = {
  // Get all incomes for the current user
  getAll: () => API.get("/incomes"),

  // Add a new income
  add: (data) =>
    API.post("/incomes", {
      source: data.source,
      amount: data.amount,
      date: data.date,
      category: data.category || null,
      frequency: data.frequency || null,
      note: data.note || null,
    }),

  // Update an existing income
  update: (id, data) =>
    API.put(`/incomes/${id}`, {
      source: data.source,
      amount: data.amount,
      date: data.date,
      category: data.category,
      frequency: data.frequency,
      note: data.note || null,
    }),

  // Delete an income
  delete: (id) => API.delete(`/incomes/${id}`),
};
