import type {
  AnalysisJobResponse,
  AnalysisJobStatus,
  AnalysisType,
} from "@/models/response/analysis";
import type { AdhocAnalysis } from "@/types/maker";
import { apiClient } from "@/queries/shared";
import { fetchStoreFixtures } from "./fixtures";

interface SubmitFixtureAnalysisParams {
  fixtureId: string;
  image: File;
  analysisType: AnalysisType;
  complianceRuleSetId: string;
}

interface MercureProgressEvent {
  job_id?: string;
  status?: AnalysisJobStatus;
  progress_message?: string;
  progress_pct?: number;
}

export interface AnalysisProgressUpdate {
  jobId: string;
  status: AnalysisJobStatus;
  progressMessage: string | null;
  progressPercent: number | null;
}

interface RunFixtureAnalysisOptions {
  onProgress?: (update: AnalysisProgressUpdate) => void;
  timeoutMs?: number;
  pollIntervalMs?: number;
}

const TERMINAL_ANALYSIS_STATUSES: AnalysisJobStatus[] = ["COMPLETED", "FAILED"];
const DEFAULT_ANALYSIS_TIMEOUT_MS = 5 * 60 * 1000;
const DEFAULT_ANALYSIS_POLL_INTERVAL_MS = 1800;

function normalizeAnalysisStatus(
  status: AnalysisJobStatus,
): "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" {
  return status.toUpperCase() as "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
}

export function isTerminalAnalysisStatus(status: AnalysisJobStatus): boolean {
  return TERMINAL_ANALYSIS_STATUSES.includes(normalizeAnalysisStatus(status));
}

export async function submitFixtureAnalysis(
  params: SubmitFixtureAnalysisParams,
): Promise<AnalysisJobResponse> {
  const { fixtureId, image, analysisType, complianceRuleSetId } = params;
  const formData = new FormData();
  formData.append("image", image);
  formData.append("analysis_type", analysisType);
  formData.append("compliance_rule_set_id", complianceRuleSetId);

  return apiClient.post<AnalysisJobResponse>(
    `/fixtures/${fixtureId}/analyze`,
    formData,
  );
}

export function fetchFixtureAnalysisJobs(
  fixtureId: string,
): Promise<AnalysisJobResponse[]> {
  return apiClient.get<AnalysisJobResponse[]>(`/fixtures/${fixtureId}/analysis`);
}

export function fetchAnalysisJob(jobId: string): Promise<AnalysisJobResponse> {
  return apiClient.get<AnalysisJobResponse>(`/analysis/${jobId}`);
}

function getMercureHubUrl(topic: string): string {
  const mercureBaseUrl =
    import.meta.env.VITE_MERCURE_HUB_URL ?? "http://localhost:3000/.well-known/mercure";
  const encodedTopic = encodeURIComponent(topic);
  return `${mercureBaseUrl}?topic=${encodedTopic}`;
}

function emitProgress(
  job: AnalysisJobResponse,
  onProgress?: (update: AnalysisProgressUpdate) => void,
): void {
  onProgress?.({
    jobId: job.id,
    status: job.status,
    progressMessage: job.progress_message,
    progressPercent: job.progress_pct,
  });
}

async function waitForTerminalByPolling(
  jobId: string,
  options?: RunFixtureAnalysisOptions,
): Promise<AnalysisJobResponse> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_ANALYSIS_TIMEOUT_MS;
  const pollIntervalMs = options?.pollIntervalMs ?? DEFAULT_ANALYSIS_POLL_INTERVAL_MS;
  const deadline = Date.now() + timeoutMs;
  let currentJob = await fetchAnalysisJob(jobId);
  emitProgress(currentJob, options?.onProgress);

  while (!isTerminalAnalysisStatus(currentJob.status)) {
    if (Date.now() >= deadline) {
      throw new Error("Timed out waiting for analysis completion.");
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    currentJob = await fetchAnalysisJob(jobId);
    emitProgress(currentJob, options?.onProgress);
  }

  return currentJob;
}

async function waitForTerminalByMercure(
  topic: string,
  fallbackJobId: string,
  options?: RunFixtureAnalysisOptions,
): Promise<AnalysisJobResponse> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_ANALYSIS_TIMEOUT_MS;
  return new Promise<AnalysisJobResponse>((resolve, reject) => {
    const eventSource = new EventSource(getMercureHubUrl(topic));
    let finished = false;

    const timeoutId = window.setTimeout(() => {
      finish(() => reject(new Error("Timed out waiting for analysis updates.")));
    }, timeoutMs);

    const finish = (cb: () => void) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeoutId);
      eventSource.close();
      cb();
    };

    const resolveWithLatestJob = async (jobId: string) => {
      try {
        const latestJob = await fetchAnalysisJob(jobId);
        emitProgress(latestJob, options?.onProgress);
        finish(() => resolve(latestJob));
      } catch (error) {
        finish(() => reject(error));
      }
    };

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as MercureProgressEvent;
        options?.onProgress?.({
          jobId: payload.job_id ?? fallbackJobId,
          status: payload.status ?? "RUNNING",
          progressMessage: payload.progress_message ?? null,
          progressPercent: payload.progress_pct ?? null,
        });
        if (payload.status && isTerminalAnalysisStatus(payload.status)) {
          void resolveWithLatestJob(payload.job_id ?? fallbackJobId);
        }
      } catch {
        // Ignore malformed events.
      }
    };

    eventSource.onerror = () => {
      finish(() => reject(new Error("Mercure stream disconnected before completion.")));
    };
  });
}

export async function runFixtureAnalysis(
  params: SubmitFixtureAnalysisParams,
  options?: RunFixtureAnalysisOptions,
): Promise<AnalysisJobResponse> {
  const submitted = await submitFixtureAnalysis(params);
  const submittedJob = await fetchAnalysisJob(submitted.id);
  emitProgress(submittedJob, options?.onProgress);

  if (!submittedJob.mercure_topic) {
    return waitForTerminalByPolling(submitted.id, options);
  }

  try {
    return await waitForTerminalByMercure(submittedJob.mercure_topic, submitted.id, options);
  } catch {
    return waitForTerminalByPolling(submitted.id, options);
  }
}

function parseDate(input: string | null): Date {
  return input ? new Date(input) : new Date();
}

function extractComplianceScore(result: Record<string, unknown> | null): number | undefined {
  if (!result) return undefined;
  const scoreCandidates = [
    result.compliance_score,
    result.complianceScore,
    (result.summary as Record<string, unknown> | undefined)?.compliance_score,
    (result.summary as Record<string, unknown> | undefined)?.complianceScore,
  ];
  for (const candidate of scoreCandidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return Math.max(0, Math.min(100, Math.round(candidate)));
    }
  }
  return undefined;
}

function toAdhocStatus(status: AnalysisJobStatus): AdhocAnalysis["status"] {
  const normalized = normalizeAnalysisStatus(status);
  if (normalized === "COMPLETED") return "completed";
  if (normalized === "FAILED") return "failed";
  return "processing";
}

export async function fetchAdhocAnalysesForStore(
  storeId?: string,
): Promise<AdhocAnalysis[]> {
  const fixtures = await fetchStoreFixtures();
  const fixtureById = new Map(fixtures.map((fixture) => [fixture.id, fixture]));

  const jobsByFixture = await Promise.all(
    fixtures.map(async (fixture) => {
      const jobs = await fetchFixtureAnalysisJobs(fixture.id);
      return jobs;
    }),
  );

  const allJobs = jobsByFixture
    .flat()
    .filter((job) => (storeId ? job.store_id === storeId : true));

  return allJobs
    .map((job): AdhocAnalysis => {
      const fixture = fixtureById.get(job.fixture_id);
      const createdAt = parseDate(job.created_at);
      const status = toAdhocStatus(job.status);
      const complianceScore = extractComplianceScore(job.result);
      const fixtureName = fixture?.code
        ? `${fixture.code} (${fixture.type})`
        : fixture?.type ?? `Fixture ${job.fixture_id.slice(0, 8)}`;

      return {
        id: job.id,
        name: `Analysis ${createdAt.toLocaleDateString()}`,
        storeId: job.store_id,
        storeName: "Current Store",
        createdAt,
        status,
        complianceScore,
        errorMessage: job.error_message ?? undefined,
        fixtureId: job.fixture_id,
        planogramId: job.planogram_id ?? undefined,
        analysisType: job.analysis_type === "ADHOC" ? "adhoc" : "planogram",
        fixtureName,
        zone: fixture?.physical_location?.zone,
        section: fixture?.physical_location?.section,
        fixtureType: fixture?.type,
        dimensions: fixture
          ? `${fixture.dimensions.width}x${fixture.dimensions.height}x${fixture.dimensions.depth} ${fixture.dimension_unit}`
          : undefined,
      };
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
