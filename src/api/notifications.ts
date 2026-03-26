import apiClient from "./client";
import type { Notification } from "../types/notification";
import type { ApiResponse, PaginatedResponse } from "../types/api";

export const notificationsApi = {
  list: (params?: { page?: number }) =>
    apiClient.get<PaginatedResponse<Notification>>("/notifications", { params }),

  markRead: (id: number) =>
    apiClient.post<ApiResponse>(`/notifications/${id}/read`),

  markAllRead: () =>
    apiClient.post<ApiResponse>("/notifications/read-all"),

  getUnreadCount: () =>
    apiClient.get<ApiResponse<{ count: number }>>("/notifications/unread-count"),
};
