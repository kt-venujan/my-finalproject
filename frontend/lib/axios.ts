import axios from "axios";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api").replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// 🔥 TOKEN AUTO ADD
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;