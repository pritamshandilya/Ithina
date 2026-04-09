import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCookie(name: string) {
  return document.cookie
    .split("; ")
    .map((cookie) => cookie.split("="))
    .find(([key]) => key === name)?.[1];
}

export function toMilliseconds(seconds?: number | string): number {
  if (seconds) return Number(seconds) * 1000;

  return -1;
}

/**
 * Strips the basepath from a URL path, making it relative to the router root.
 * Useful when capturing location.pathname which includes the platform's basepath.
 */
export function getRelativePath(path: string): string {
  if (!path) return "/";

  const base = (import.meta.env.BASE_URL || "/")
    .split("?")[0]
    .replace(/\/$/, "");

  let relativePath = path;

  // Try to remove the configured base path
  if (base && base !== "/" && relativePath.startsWith(base)) {
    relativePath = relativePath.slice(base.length);
  }

  // Fallback: specifically check for the project's base path if it's there
  if (relativePath.startsWith("/cbai/plannogram")) {
    relativePath = relativePath.slice(16);
  }

  // Ensure it starts with a single slash
  if (!relativePath.startsWith("/")) {
    relativePath = "/" + relativePath;
  }

  return relativePath;
}
