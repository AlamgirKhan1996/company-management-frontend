import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://company-management-backend-production.up.railway.app",
  withCredentials: true,
});

// BUG FIXED: the original interceptor attached x-company-id but NEVER attached
// the Authorization: Bearer <token> header. Every API call was unauthenticated →
// backend returned 401 → dashboard appeared blank after login.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    const companyId = localStorage.getItem("companyId");
    if (companyId) {
      config.headers = config.headers ?? {};
      config.headers["x-company-id"] = companyId;
    }
  }
  return config;
});

// 401 interceptor — clear stale token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/login")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("companyId");
      localStorage.removeItem("company");
      window.location.replace("/login");
    }
    return Promise.reject(error);
  }
);

export default api;
