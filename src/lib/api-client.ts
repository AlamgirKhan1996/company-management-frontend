import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://company-management-backend-production.up.railway.app",
  withCredentials: true,
});

// Attach token automatically
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const companyId = localStorage.getItem("companyId");

    if (companyId) {
      config.headers = config.headers ?? {};
      // Common multi-tenant header; backend can read this.
      (config.headers as any)["x-company-id"] = companyId;
    }
  }
  return config;
});

export default api;
