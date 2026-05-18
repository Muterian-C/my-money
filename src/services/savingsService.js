import API from "../api/api";

export const savingsService = {
  // Get all savings goals for the current user
  getAll: () => API.get("/savings"),

  // Add a new savings goal
  add: (data) =>
    API.post("/savings", {
      name: data.name,
      target: data.target,
      saved: data.saved || 0,
      deadline: data.deadline || null,
      color: data.color || "#10b981",
    }),

  // Update an existing savings goal (full update)
  update: (id, data) =>
    API.put(`/savings/${id}`, {
      name: data.name,
      target: data.target,
      saved: data.saved,
      deadline: data.deadline,
      color: data.color,
    }),

  // Delete a savings goal
  delete: (id) => API.delete(`/savings/${id}`),

  // Special method for just updating the saved amount
  updateSaved: (id, savedAmount) =>
    API.put(`/savings/${id}`, { saved: savedAmount }),
};
