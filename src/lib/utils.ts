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
