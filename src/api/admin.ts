import apiClient from "./client";
import { config } from "../constants/config";
import type { ApiResponse, PaginatedResponse } from "../types/api";
import type {
  AdminUser,
  AdminUserDetail,
  CreateUserPayload,
  HiddenUser,
  OnlineUser,
  ProgressSection,
  ProgressSnapshot,
  ProgressTask,
  SupportTicket,
  SystemStats,
  TicketDetail,
  TicketPriority,
  TicketStatus,
  UpdateUserPayload,
  UserFilters,
  VisitorMessage,
} from "../types/admin";

/**
 * Admin API client.
 *
 * IMPORTANT: The Laravel backend exposes most admin functionality under
 * session-authenticated web routes (routes/admin.php). Only a small subset is
 * currently on routes/api.php under `/admin/*` with the sanctum + admin gate.
 *
 * Confirmed mobile-friendly endpoints (api.php):
 *   - GET  /api/admin/users              (stub; returns static message — backend TODO)
 *   - GET  /api/admin/system-stats       (stub; returns static values — backend TODO)
 *   - POST /api/admin/bulk-actions       (stub; backend TODO)
 *   - GET  /api/admin/online-users       [OnlineUsersController::index] CONFIRMED
 *   - GET  /api/admin/online-users/count [OnlineUsersController::count] CONFIRMED
 *
 * All other endpoints (users CRUD, tickets, visitor messages, progress,
 * lock/verify/reset-password) exist only on the web admin panel and would need
 * corresponding `/v1/mobile/admin/*` API routes added to the Laravel side
 * before they'll work. Until then we call them through absolute URLs pointing
 * at the web admin routes — they WILL 401 on mobile because the admin web
 * middleware requires a session cookie. These calls are wired so the UI is
 * ready the moment the backend exposes the endpoints.
 */

// Build an absolute web URL (not /v1/mobile) for stubs that target the
// existing web admin panel until mobile endpoints are added.
const WEB_ADMIN_BASE = (() => {
  // API_BASE_URL is like http://.../api — strip trailing /api for host root.
  return config.API_BASE_URL.replace(/\/api\/?$/, "");
})();

function webAdminUrl(path: string): string {
  return `${WEB_ADMIN_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

// ---------- Users ----------

export const adminUsersApi = {
  // STUB: backend returns placeholder; call shape is ready for when it's implemented.
  list: (filters: UserFilters = {}) =>
    apiClient.get<PaginatedResponse<AdminUser>>("/admin/users", {
      params: filters,
    }),

  get: (id: number) =>
    apiClient.get<ApiResponse<AdminUserDetail>>(`/admin/users/${id}`),

  create: (data: CreateUserPayload) =>
    apiClient.post<ApiResponse<AdminUser>>("/admin/users", data),

  update: (id: number, data: UpdateUserPayload) =>
    apiClient.put<ApiResponse<AdminUser>>(`/admin/users/${id}`, data),

  remove: (id: number) =>
    apiClient.delete<ApiResponse>(`/admin/users/${id}`),

  toggleVerification: (id: number) =>
    apiClient.post<ApiResponse>(`/admin/users/${id}/toggle-verification`),

  toggleLock: (id: number) =>
    apiClient.post<ApiResponse>(`/admin/users/${id}/toggle-lock`),

  resetPassword: (id: number, password: string) =>
    apiClient.post<ApiResponse>(`/admin/users/${id}/reset-password`, {
      password,
    }),

  bulkAction: (ids: number[], action: "delete" | "lock" | "unlock" | "verify") =>
    apiClient.post<ApiResponse>("/admin/bulk-actions", { ids, action }),
};

// ---------- Tickets ----------

export const adminTicketsApi = {
  list: (params?: { status?: TicketStatus; source?: string; q?: string; page?: number }) =>
    apiClient.get<PaginatedResponse<SupportTicket>>("/admin/tickets", { params }),

  get: (id: number) =>
    apiClient.get<ApiResponse<TicketDetail>>(`/admin/tickets/${id}`),

  reply: (id: number, body: string) =>
    apiClient.post<ApiResponse>(`/admin/tickets/${id}/reply`, { body }),

  updateStatus: (id: number, status: TicketStatus) =>
    apiClient.patch<ApiResponse>(`/admin/tickets/${id}/status`, { status }),

  updatePriority: (id: number, priority: TicketPriority) =>
    apiClient.patch<ApiResponse>(`/admin/tickets/${id}/priority`, { priority }),

  // Fallback to web admin route for the visitor chatbot queue (needs session).
  webListVisitorMessagesUrl: () =>
    webAdminUrl("/admin/support-chat/api/messages"),
};

// ---------- Visitor messages ----------

export const adminVisitorMessagesApi = {
  list: (params?: { q?: string; page?: number }) =>
    apiClient.get<PaginatedResponse<VisitorMessage>>("/admin/visitor-messages", {
      params,
    }),

  resolve: (id: number) =>
    apiClient.patch<ApiResponse>(`/admin/visitor-messages/${id}/resolve`),

  reply: (id: number, body: string) =>
    apiClient.post<ApiResponse>(`/admin/visitor-messages/${id}/reply`, { body }),
};

// ---------- Monitor ----------

export const adminMonitorApi = {
  // CONFIRMED on api.php
  onlineUsers: () =>
    apiClient.get<ApiResponse<OnlineUser[]>>("/admin/online-users"),

  // CONFIRMED on api.php
  onlineUsersCount: () =>
    apiClient.get<ApiResponse<{ count: number }>>("/admin/online-users/count"),

  // STUB until mobile endpoint exists
  hiddenUsers: () =>
    apiClient.get<ApiResponse<HiddenUser[]>>("/admin/hidden-users"),

  toggleHidden: (id: number) =>
    apiClient.post<ApiResponse>(`/admin/users/${id}/toggle-hidden`),
};

// ---------- System stats ----------

export const adminStatsApi = {
  // CONFIRMED path (returns static placeholder from api.php today)
  get: () => apiClient.get<ApiResponse<SystemStats>>("/admin/system-stats"),
};

// ---------- Progress ----------

export const adminProgressApi = {
  sections: () =>
    apiClient.get<ApiResponse<ProgressSection[]>>("/admin/progress/sections"),

  sectionDetail: (id: number) =>
    apiClient.get<ApiResponse<ProgressSection>>(`/admin/progress/sections/${id}`),

  tasks: (sectionId?: number) =>
    apiClient.get<ApiResponse<ProgressTask[]>>("/admin/progress/tasks", {
      params: { section_id: sectionId },
    }),

  updateTask: (id: number, data: Partial<ProgressTask>) =>
    apiClient.patch<ApiResponse<ProgressTask>>(`/admin/progress/tasks/${id}`, data),

  snapshots: () =>
    apiClient.get<ApiResponse<ProgressSnapshot[]>>("/admin/progress/snapshots"),

  createSnapshot: (label: string) =>
    apiClient.post<ApiResponse<ProgressSnapshot>>("/admin/progress/snapshots", {
      label,
    }),
};

// Aggregate export for convenience.
export const adminApi = {
  users: adminUsersApi,
  tickets: adminTicketsApi,
  visitorMessages: adminVisitorMessagesApi,
  monitor: adminMonitorApi,
  stats: adminStatsApi,
  progress: adminProgressApi,
};

export default adminApi;
