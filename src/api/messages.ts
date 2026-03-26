import apiClient from "./client";
import type { Conversation, Message } from "../types/message";
import type { ApiResponse, PaginatedResponse } from "../types/api";

export const messagesApi = {
  getConversations: (params?: { page?: number }) =>
    apiClient.get<PaginatedResponse<Conversation>>("/messages/conversations", { params }),

  getMessages: (conversationId: number, params?: { page?: number }) =>
    apiClient.get<PaginatedResponse<Message>>(`/messages/conversations/${conversationId}`, { params }),

  sendMessage: (conversationId: number, text: string) =>
    apiClient.post<ApiResponse<Message>>(`/messages/conversations/${conversationId}`, { text }),

  markRead: (conversationId: number) =>
    apiClient.post<ApiResponse>(`/messages/conversations/${conversationId}/read`),

  getUnreadCount: () =>
    apiClient.get<ApiResponse<{ count: number }>>("/messages/unread-count"),
};
