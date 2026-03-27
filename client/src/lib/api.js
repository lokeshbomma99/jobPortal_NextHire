import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => {
    const d = res.data;
    if (d && d.success !== undefined) {
      // If response has both user and (jobs or applications), it's a detail view, don't unwrap!
      if (d.user !== undefined && (d.jobs !== undefined || d.applications !== undefined)) {
        return res;
      }

      if (d.jobs !== undefined && !d.total && !d.pages) {
        res.data = d.jobs;
      } else if (d.applications !== undefined && !d.total) {
        res.data = d.applications;
      } else if (d.job !== undefined && !d.jobs) {
        res.data = d.job;
      } else if (d.user !== undefined && !d.token) {
        res.data = d.user;
      } else if (d.data !== undefined) {
        res.data = d.data;
      }
    }
    return res;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  changePassword: (data) => api.put("/auth/password", data),

  // ✅ FIXED: These were wrongly pointing to /auth — moved to /users
  updateProfile: (data) => api.put("/users/profile", data),
  uploadAvatar: (formData) => api.post("/users/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  uploadResume: (formData) => api.post("/users/resume", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  getPublicProfile: (id) => api.get(`/users/profile/${id}`),
};

export const jobsAPI = {
  getAll: (params) => api.get("/jobs", { params }),
  getFeatured: () => api.get("/jobs/featured"),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post("/jobs", data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  apply: (id, data) => api.post(`/jobs/${id}/apply`, data),
  toggleSave: (id) => api.post(`/jobs/${id}/save`),
  getSaved: () => api.get("/jobs/saved"),
  getEmployerJobs: () => api.get("/jobs/employer/mine"),
  getEmployerApplications: () => api.get("/jobs/employer/applications"),
  getSeekerApplications: () => api.get("/jobs/seeker/applications"),
  updateApplicationStatus: (jobId, appId, status) =>
    api.put(`/jobs/${jobId}/applications/${appId}/status`, { status }),
};

export const chatAPI = {
  getConversations: () => api.get("/chat"),
  getOrCreate: (data) => api.post("/chat", data),
  getMessages: (conversationId) => api.get(`/chat/${conversationId}/messages`),
  sendMessage: (conversationId, content) => api.post(`/chat/${conversationId}/messages`, { content }),
  getUnreadCount: () => api.get("/chat/unread"),
};

export const notificationsAPI = {
  getAll: () => api.get("/notifications"),
  getUnreadCount: () => api.get("/notifications/unread"),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put("/notifications/read-all"),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  getUsers: (params) => api.get("/admin/users", { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  toggleJobFeatured: (id) => api.put(`/admin/jobs/${id}/feature`),
};

export default api;