import axios from "axios";

const getBaseApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const rawUrl = envUrl && typeof envUrl === "string" && envUrl.trim() ? envUrl.trim() : "https://youmatter-reborn.onrender.com";
  let trimmed = rawUrl.replace(/\/$/, "");
  if (trimmed.endsWith("/user")) {
    trimmed = trimmed.replace(/\/user$/, "");
  }
  if (!trimmed.endsWith("/api/v1")) {
    trimmed = `${trimmed}/api/v1`;
  }
  return trimmed;
};

const api = axios.create({
  baseURL: getBaseApiUrl(),
});

api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem("token") || localStorage.getItem("youmatter_token") || localStorage.getItem("supabase_token");

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
