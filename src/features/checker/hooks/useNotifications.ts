/**
 * useNotifications Hook
 * 
 * TanStack Query hook for fetching checker notifications.
 * 
 * Features:
 * - Automatic caching (30 second stale time)
 * - Polling every 30 seconds for new notifications
 * - Refetch on window focus
 * - Type-safe with TypeScript
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../api/checker";
import { mockCheckerUser } from "@/lib/api/mock-data";
import type { Notification } from "@/types/checker";

/**
 * Query key factory for notifications
 */
export const notificationsKeys = {
  all: ["checker", "notifications"] as const,
  byUser: (userId: string) => [...notificationsKeys.all, userId] as const,
  byStore: (userId: string, storeId: string) => [...notificationsKeys.all, userId, storeId] as const,
};

/**
 * Hook to fetch notifications for the checker
 * 
 * @param storeId - Optional store ID to filter notifications
 * @returns TanStack Query result with notifications data
 * 
 * @example
 * ```tsx
 * const { data: notifications, isLoading } = useNotifications(selectedStoreId);
 * ```
 */
export function useNotifications(storeId?: string) {
  return useQuery({
    queryKey: storeId 
      ? notificationsKeys.byStore(mockCheckerUser.id, storeId)
      : notificationsKeys.byUser(mockCheckerUser.id),
    queryFn: () => fetchNotifications(mockCheckerUser.id, storeId),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Poll every 30 seconds for new notifications
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to mark a notification as read with optimistic update
 * 
 * @returns Mutation function to mark notification as read
 * 
 * @example
 * ```tsx
 * const markAsRead = useMarkNotificationAsRead();
 * markAsRead.mutate('notif-123');
 * ```
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    // Optimistic update
    onMutate: async (notificationId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationsKeys.all });

      // Snapshot the previous value
      const previousNotifications = queryClient.getQueryData(
        notificationsKeys.byUser(mockCheckerUser.id)
      );

      // Optimistically update to the new value
      queryClient.setQueryData<Notification[]>(
        notificationsKeys.byUser(mockCheckerUser.id),
        (old) => old?.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );

      return { previousNotifications };
    },
    // On error, rollback
    onError: (err, notificationId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          notificationsKeys.byUser(mockCheckerUser.id),
          context.previousNotifications
        );
      }
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}

/**
 * Hook to mark all notifications as read with optimistic update
 * 
 * @returns Mutation function to mark all notifications as read
 * 
 * @example
 * ```tsx
 * const markAllAsRead = useMarkAllNotificationsAsRead();
 * markAllAsRead.mutate();
 * ```
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(mockCheckerUser.id),
    // Optimistic update
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationsKeys.all });

      const previousNotifications = queryClient.getQueryData(
        notificationsKeys.byUser(mockCheckerUser.id)
      );

      // Mark all as read
      queryClient.setQueryData<Notification[]>(
        notificationsKeys.byUser(mockCheckerUser.id),
        (old) => old?.map((n) => ({ ...n, read: true }))
      );

      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          notificationsKeys.byUser(mockCheckerUser.id),
          context.previousNotifications
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}
