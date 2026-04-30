import assert from "node:assert/strict";
import test from "node:test";

type FetchCall = {
  input: string | URL | Request;
  init?: RequestInit;
};

type MockFetchResponse = {
  status?: number;
  headers?: HeadersInit;
  body?: unknown;
};

type TestGlobal = typeof globalThis & {
  self?: unknown;
  window?: {
    location: { origin: string };
    setTimeout: typeof setTimeout;
    clearTimeout: typeof clearTimeout;
    dispatchEvent: (event: Event) => boolean;
  };
  localStorage?: Storage;
  sessionStorage?: Storage;
  EventSource?: typeof EventSource;
  fetch?: typeof fetch;
};

class MemoryStorage implements Storage {
  private items = new Map<string, string>();

  get length(): number {
    return this.items.size;
  }

  clear(): void {
    this.items.clear();
  }

  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.items.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.items.delete(key);
  }

  setItem(key: string, value: string): void {
    this.items.set(key, value);
  }
}

class MockEventSource {
  static instances: MockEventSource[] = [];

  onopen: (() => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  closed = false;

  constructor(readonly url: string) {
    MockEventSource.instances.push(this);
  }

  close(): void {
    this.closed = true;
  }
}

function setupBrowserGlobals(): void {
  const storage = new MemoryStorage();
  const global = globalThis as TestGlobal;
  global.self = globalThis;
  global.localStorage = storage;
  global.sessionStorage = storage;
  global.window = {
    location: { origin: "https://frontend.test" },
    setTimeout,
    clearTimeout,
    dispatchEvent: () => true,
  };
  global.EventSource = MockEventSource as unknown as typeof EventSource;
}

function installFetchQueue(responses: MockFetchResponse[]): FetchCall[] {
  const calls: FetchCall[] = [];
  const global = globalThis as TestGlobal;
  global.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ input, init });
    const next = responses.shift();
    assert.ok(next, `Unexpected fetch call to ${String(input)}`);
    return new Response(
      next.body === undefined ? undefined : JSON.stringify(next.body),
      {
        status: next.status ?? 200,
        headers: {
          "Content-Type": "application/json",
          ...next.headers,
        },
      },
    );
  }) as typeof fetch;
  return calls;
}

async function waitForEventSource(): Promise<MockEventSource> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const source = MockEventSource.instances.at(-1);
    if (source) return source;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error("EventSource was not created");
}

function makeJob(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: "job-1",
    store_id: "store-1",
    fixture_id: "fixture-1",
    analysis_type: "PLANOGRAM",
    planogram_id: "planogram-1",
    compliance_rule_set_id: "rules-1",
    status: "PENDING",
    progress_message: "Queued",
    progress_pct: 0,
    result: null,
    error_message: null,
    image_path: "store-1/analysis/image.jpg",
    image_name: "image.jpg",
    image_size: 123,
    image_mime_type: "image/jpeg",
    started_at: null,
    completed_at: null,
    mercure_topic: "analysis/job-1",
    created_at: "2026-04-29T00:00:00Z",
    updated_at: "2026-04-29T00:00:00Z",
    ...overrides,
  };
}

setupBrowserGlobals();

test("parseMercureLinkHeader extracts the hub URL", async () => {
  const { parseMercureLinkHeader } = await import("../src/hooks/use-mercure");

  assert.equal(
    parseMercureLinkHeader(
      '<https://mercure.example/.well-known/mercure>; rel="mercure"',
    ),
    "https://mercure.example/.well-known/mercure",
  );
});

test("apiClient.postWithResponse returns data, status, and headers", async () => {
  const { apiClient } = await import("../src/queries/api-client");
  installFetchQueue([
    {
      status: 202,
      headers: { Link: '<https://mercure.example/events>; rel="mercure"' },
      body: { ok: true },
    },
  ]);

  const response = await apiClient.postWithResponse<{ ok: boolean }>(
    "https://api.example.test/resource",
    { name: "Fixture" },
  );

  assert.equal(response.status, 202);
  assert.deepEqual(response.data, { ok: true });
  assert.equal(
    response.headers.get("Link"),
    '<https://mercure.example/events>; rel="mercure"',
  );
});

test("runFixtureAnalysis subscribes to Mercure using submit response headers", async () => {
  MockEventSource.instances = [];
  const calls = installFetchQueue([
    {
      status: 202,
      headers: {
        Link: '<https://mercure.example/.well-known/mercure>; rel="mercure"',
        "Mercure-Authorization": "subscriber-token",
      },
      body: makeJob(),
    },
    {
      body: makeJob({
        status: "COMPLETED",
        progress_message: "Analysis complete",
        progress_pct: 100,
        result: { count: 0 },
      }),
    },
  ]);
  const { runFixtureAnalysis } =
    await import("../src/queries/maker/api/analysis");
  const progressMessages: Array<string | null> = [];

  const resultPromise = runFixtureAnalysis(
    {
      fixtureId: "fixture-1",
      image: new File(["fake"], "fixture.jpg", { type: "image/jpeg" }),
      analysisType: "PLANOGRAM",
      planogramId: "planogram-1",
    },
    {
      timeoutMs: 1000,
      onProgress: (update) => progressMessages.push(update.progressMessage),
    },
  );

  const source = await waitForEventSource();
  source.onopen?.();
  source.onmessage?.(
    new MessageEvent("message", {
      data: JSON.stringify({
        job_id: "job-1",
        status: "COMPLETED",
        progress_message: "Analysis complete",
        progress_pct: 100,
      }),
    }),
  );

  const result = await resultPromise;
  const url = new URL(source.url);

  assert.equal(result.status, "COMPLETED");
  assert.equal(
    url.origin + url.pathname,
    "https://mercure.example/.well-known/mercure",
  );
  assert.equal(url.searchParams.get("authorization"), "subscriber-token");
  assert.equal(url.searchParams.get("topic"), "analysis/job-1");
  assert.equal(source.closed, true);
  assert.equal(calls.length, 2);
  assert.match(String(calls[1]?.input), /\/api\/v1\/analysis\/job-1$/);
  assert.deepEqual(progressMessages, [
    "Queued",
    "Analysis complete",
    "Analysis complete",
  ]);
});

test("runFixtureAnalysis falls back to polling when Mercure headers are missing", async () => {
  MockEventSource.instances = [];
  const calls = installFetchQueue([
    { status: 202, body: makeJob() },
    {
      body: makeJob({
        status: "RUNNING",
        progress_message: "Detecting products",
        progress_pct: 50,
      }),
    },
    {
      body: makeJob({
        status: "COMPLETED",
        progress_message: "Analysis complete",
        progress_pct: 100,
      }),
    },
  ]);
  const { runFixtureAnalysis } =
    await import("../src/queries/maker/api/analysis");

  const result = await runFixtureAnalysis(
    {
      fixtureId: "fixture-1",
      image: new File(["fake"], "fixture.jpg", { type: "image/jpeg" }),
      analysisType: "PLANOGRAM",
    },
    { timeoutMs: 1000, pollIntervalMs: 1 },
  );

  assert.equal(result.status, "COMPLETED");
  assert.equal(MockEventSource.instances.length, 0);
  assert.equal(calls.length, 3);
  assert.match(String(calls[1]?.input), /\/api\/v1\/analysis\/job-1$/);
  assert.match(String(calls[2]?.input), /\/api\/v1\/analysis\/job-1$/);
});
