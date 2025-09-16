"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Notification, ApiResponse } from "@/types/api";
import { apiService } from "@/lib/api-service";

export const NOTIFICATIONS_QK = ["blog-notifications"] as const;

export function useNotifications() {
  const queryClient = useQueryClient();

  // Fetch list
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<Notification[], Error>({
    queryKey: NOTIFICATIONS_QK,
    queryFn: async () => {
      const res = await apiService.fetchNotifications(); 
      if ((res as ApiResponse<Notification[]>)?.code === 200 && Array.isArray((res as ApiResponse<Notification[]>)?.data)) {
        return (res as ApiResponse<Notification[]>)!.data!;
      }
      throw new Error((res as ApiResponse<Notification[]>)?.message || "Không thể tải thông báo");
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // Helpers
  const notifications = useMemo(() => data ?? [], [data]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const markReadLocal = (id: string) => {
    queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QK, (prev) => {
      if (!prev) return prev;
      return prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    });
  };

  const markAllReadLocal = () => {
    queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QK, (prev) => {
      if (!prev) return prev;
      return prev.map((n) => (n.isRead ? n : { ...n, isRead: true }));
    });
  };

  const removeLocal = (id: string) => {
    queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QK, (prev) => {
      if (!prev) return prev;
      return prev.filter((n) => n.id !== id);
    });
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    markReadLocal,
    markAllReadLocal,
    removeLocal,
  };
}
