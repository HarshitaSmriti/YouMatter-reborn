import axios from "axios";

const getBaseApiUrl = () => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (!envUrl) return "https://youmatter-reborn.onrender.com/api/v1";
  const trimmed = envUrl.replace(/\/$/, "");
  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
};

const api = axios.create({
  baseURL: getBaseApiUrl(),
});

api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

export default api;
