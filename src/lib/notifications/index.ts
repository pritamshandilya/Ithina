export type NotificationLevel = "info" | "success" | "warning" | "error";

export interface AppNotification {
  id: string;
  title: string;
  message?: string;
  level: NotificationLevel;
  createdAt: string;
}
