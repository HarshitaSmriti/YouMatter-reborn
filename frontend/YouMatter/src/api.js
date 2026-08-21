const getBaseApiUrl = () => {
  const envUrl = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL;
  if (!envUrl) return "https://youmatter-reborn.onrender.com/api/v1";
  const trimmed = envUrl.replace(/\/$/, "");
  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
};

const BASE_URL = getBaseApiUrl();

export const apiRequest = async (endpoint, method = "GET", body = null) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Error");
  }

  return res.json();
};
