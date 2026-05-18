import API from "../api/api";

export const expenseService = {
  getAll: () => API.get("/expenses"),

  add: (data) =>
    API.post("/expenses", {
      name: data.name,
      amount: data.amount,
      category: data.category || null,
      type: data.type || null,
      date: data.date,
    }),

  delete: (id) => API.delete(`/expenses/${id}`),
};