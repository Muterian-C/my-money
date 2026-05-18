import API from "../api/api";

export const savingsService = {
  getAll: () => API.get("/savings"),

  add: (data) =>
    API.post("/savings", {
      name: data.name,
      target: data.target,
      saved: data.saved || 0,
      deadline: data.deadline || null,
      color: data.color || "#6366f1",
    }),

  update: (id, data) => API.put(`/savings/${id}`, data),

  delete: (id) => API.delete(`/savings/${id}`),
};