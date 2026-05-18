// authService.js — thin wrappers around AuthContext methods
// You won't call this directly; use useAuth() hook from AuthContext instead.
// This file exists for any standalone auth calls outside the context.

import API from "../api/api";

export const authService = {
  login: (email, password) =>
    API.post("/auth/login", { email, password }),

  register: (name, email, password, payDay) =>
    API.post("/auth/register", { name, email, password, pay_day: payDay }),

  getMe: () =>
    API.get("/auth/me"),
};