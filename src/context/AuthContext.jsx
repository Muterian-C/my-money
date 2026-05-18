import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading = true

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      console.log("Loading user, token exists:", !!token);

      if (!token) {
        console.log("No token, setting loading to false");
        setLoading(false);
        return;
      }

      try {
        console.log("Verifying token with backend...");
        const response = await API.get("/auth/me");
        console.log("User loaded:", response.data);
        setUser(response.data);
      } catch (error) {
        console.error("Auth check failed:", error.response?.status);
        // Only clear token if it's an auth error
        if (error.response?.status === 401 || error.response?.status === 422) {
          localStorage.removeItem("token");
        }
        setUser(null);
      } finally {
        setLoading(false); // Always set loading to false when done
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await API.post("/auth/login", { email, password });
      const { access_token, user } = response.data;
      localStorage.setItem("token", access_token);
      setUser(user);
      return { success: true, user };
    } catch (error) {
      console.error("Login error:", error.response?.data);
      return { success: false, message: error.response?.data?.error || "Login failed" };
    }
  };

  const register = async (name, email, password, payDay = 28) => {
    try {
      const response = await API.post("/auth/register", {
        name,
        email,
        password,
        pay_day: payDay,
      });
      const { access_token, user } = response.data;
      localStorage.setItem("token", access_token);
      setUser(user);
      return { success: true, user };
    } catch (error) {
      console.error("Registration error:", error.response?.data);
      return { success: false, message: error.response?.data?.error || "Registration failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
