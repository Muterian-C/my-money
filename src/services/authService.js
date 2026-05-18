// authService.js — thin wrappers for authentication
// Use useAuth() hook from AuthContext for most cases
// This file is for standalone auth calls outside the context

import API from "../api/api";

export const authService = {
  login: (email, password) =>
    API.post("/auth/login", { email, password }),

  register: (name, email, password, payDay = 28) =>
    API.post("/auth/register", { 
      name, 
      email, 
      password, 
      pay_day: payDay 
    }),

  getMe: () => API.get("/auth/me"),
  
  logout: () => {
    localStorage.removeItem("token");
  },
};
