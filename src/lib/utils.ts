export function getCookie(name: string) {
  return document.cookie
    .split("; ")
    .map((cookie) => cookie.split("="))
    .find(([key]) => key === name)?.[1];
}

export function toMilliseconds(seconds?: number | string): number {
  if (!seconds) return -1;
  else return Number(seconds) * 1000;
}
