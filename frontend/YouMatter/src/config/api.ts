import axios from "axios";

const getBaseApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const rawUrl = envUrl && typeof envUrl === "string" && envUrl.trim() ? envUrl.trim() : "https://youmatter-reborn.onrender.com";
  const trimmed = rawUrl.replace(/\/$/, "");
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
