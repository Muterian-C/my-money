import API from "../api/api";

export const incomeService = {
  getAll: () => API.get("/incomes"),

  add: (data) =>
    API.post("/incomes", {
      source: data.source,
      amount: data.amount,
      date: data.date,
      category: data.category || null,
      frequency: data.frequency || null,
    }),

  delete: (id) => API.delete(`/incomes/${id}`),
};