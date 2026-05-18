import API from "../api/api";

export const analyticsService = {
  getSummary: () => API.get("/analytics/summary"),
};