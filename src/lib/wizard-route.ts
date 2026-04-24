/**
 * Wizard is mounted under _authenticated as `/wizard` and under _maker as `/maker/wizard`.
 * When navigating from maker routes, always use `/maker/wizard` to avoid switching
 * layout trees and a brief flash of the wrong shell (e.g. legacy dashboard).
 */
export type WizardEntryPath = "/maker/wizard" | "/wizard";

export function wizardEntryPathFromPathname(pathname: string): WizardEntryPath {
  return pathname.startsWith("/maker") ? "/maker/wizard" : "/wizard";
}

export function wizardEntryPathForRole(role: string | undefined): WizardEntryPath {
  return role === "maker" ? "/maker/wizard" : "/wizard";
}
