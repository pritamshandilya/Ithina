/**
 * API Types – Root Barrel
 *
 * Re-exports all API response and payload types from a single entry point.
 *
 * Usage:
 *   import type { LoginResponse, LoginPayload } from "@/api-types";
 *
 * Or import from specific sub-module for clarity:
 *   import type { AuditResponse } from "@/api-types/response";
 *   import type { SubmitAuditPayload } from "@/api-types/payload";
 */

export type * from "./response";
export type * from "./request";
