import axios from "axios";

const API = axios.create({
  baseURL: "https://muterian.pythonanywhere.com/api",  // Your PythonAnywhere URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401s globally — token expired or invalid
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/"; // Redirect to landing page
    }
    return Promise.reject(error);
  }
);

export default API;