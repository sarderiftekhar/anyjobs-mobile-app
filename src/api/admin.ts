import apiClient from "./client";
import type { ApiResponse } from "../types/api";
import type { OnlineUser, SystemStats } from "../types/admin";

/**
 * Admin API client — only what the mobile admin dashboard uses.
 *
 * The rest of the admin panel (users, tickets, visitor messages, progress)
 * lives on session-authenticated web routes with no /v1/mobile equivalent, so
 * the app doesn't call it. Add mobile routes on the backend first if the
 * admin section grows.
 */

export const adminMonitorApi = {
  onlineUsers: () =>
    apiClient.get<ApiResponse<OnlineUser[]>>("/admin/online-users"),

  onlineUsersCount: () =>
    apiClient.get<ApiResponse<{ count: number }>>("/admin/online-users/count"),
};

export const adminStatsApi = {
  get: () => apiClient.get<ApiResponse<SystemStats>>("/admin/system-stats"),
};
