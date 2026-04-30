/**
 * Wizard draft progress (frontend-only).
 *
 * The backend `/draft/save` endpoint persists session_id, hardware_targets, name and
 * schedule fields, but **not** the wizard step the user was on when they saved. To
 * preserve the user's exit point so the All Campaigns table can reflect the correct
 * pipeline stage (e.g. "Guard Rails" instead of falling back to "Design"), we mirror
 * the wStep locally keyed by campaign id.
 *
 * Scope: client-only hint. If the entry is missing (different browser, cleared
 * storage, etc.) the pipeline falls back to the backend-derived value, so this is
 * always additive — never authoritative.
 */

const STORAGE_KEY = "promo:wizardDraftProgress:v1";

export interface DraftProgressEntry {
  /** wStep the user was on at the moment of save (1..5 in NL flow). */
  step: number;
  /** Wizard mode at save time. Reserved for future use. */
  mode?: "nl" | "manual" | "";
  /** LangGraph session_id from POST /campaigns/draft. Required by /campaigns/generate. */
  sessionId?: string;
  /** Wall-clock timestamp of the save. */
  savedAt: number;
}

type ProgressMap = Record<string, DraftProgressEntry>;

function readMap(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as ProgressMap;
    }
    return {};
  } catch {
    return {};
  }
}

function writeMap(map: ProgressMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // localStorage may be unavailable (private mode / quota) — non-fatal.
  }
}

export function setDraftProgress(
  id: string,
  step: number,
  mode?: "nl" | "manual" | "",
  sessionId?: string | null,
): void {
  if (!id) return;
  const map = readMap();
  const prev = map[id];
  map[id] = {
    step,
    mode,
    sessionId: sessionId ?? prev?.sessionId,
    savedAt: Date.now(),
  };
  writeMap(map);
}

export function getDraftProgress(id: string | null | undefined): DraftProgressEntry | null {
  if (!id) return null;
  const map = readMap();
  return map[id] ?? null;
}

export function clearDraftProgress(id: string | null | undefined): void {
  if (!id) return;
  const map = readMap();
  if (map[id]) {
    delete map[id];
    writeMap(map);
  }
}

/**
 * Maps a wizard step (NL flow) to a pipeline breadcrumb. Used to override the
 * backend-derived pipeline for `draft` campaigns when we know the user reached
 * a later stage (Guard Rails, Schedule, Approval) before saving and exiting.
 */
const NL_STEP_TO_PIPELINE: Readonly<Record<number, readonly string[]>> = {
  1: ["Data"],
  2: ["Data", "Design"],
  3: ["Data", "Design", "Guard Rails"],
  4: ["Data", "Design", "Guard Rails", "Schedule"],
  5: ["Data", "Design", "Guard Rails", "Approval"],
};

export function pipelineFromDraftProgress(step: number): string[] | null {
  const entry = NL_STEP_TO_PIPELINE[step];
  return entry ? [...entry] : null;
}
