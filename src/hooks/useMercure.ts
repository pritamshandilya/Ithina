interface MercureSubscribeOptions<TPayload> {
  hubUrl?: string;
  topics: string | string[];
  authorization: string;
  timeoutMs?: number;
  closeOnMessage?: boolean;
  parseMessage?: (event: MessageEvent) => TPayload | null;
  shouldClose?: (payload: TPayload, event: MessageEvent) => boolean;
  onOpen?: () => void;
  onMessage?: (payload: TPayload, event: MessageEvent) => void;
  onError?: (error: unknown) => void;
}

interface MercureSubscription {
  close: () => void;
}

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

export function parseMercureLinkHeader(header?: string | null): string | null {
  if (!header) return null;
  return /<?([^>\s]+)>?;\s*rel[:=]\s*"?mercure"?/i.exec(header)?.[1] ?? null;
}

function getMercureHubUrl(hubUrl?: string): string {
  return (
    hubUrl ??
    import.meta.env.VITE_MERCURE_HUB_URL ??
    import.meta.env.VITE_MERCURE_URL ??
    "/events"
  );
}

function defaultParseMessage<TPayload>(event: MessageEvent): TPayload | null {
  try {
    return JSON.parse(event.data) as TPayload;
  } catch {
    return null;
  }
}

export function createMercureClient() {
  function subscribe<TPayload = unknown>(
    options: MercureSubscribeOptions<TPayload>,
  ): Promise<MercureSubscription> {
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const baseUrl = getMercureHubUrl(options.hubUrl);
    const url = baseUrl.startsWith("/")
      ? new URL(baseUrl, window.location.origin)
      : new URL(baseUrl);
    const parseMessage = options.parseMessage ?? defaultParseMessage<TPayload>;
    const topics = Array.isArray(options.topics)
      ? options.topics
      : [options.topics];
    for (const topic of topics) {
      url.searchParams.append("topic", topic);
    }
    url.searchParams.append("authorization", options.authorization);

    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(url.toString());
      let settled = false;

      const timeoutId = window.setTimeout(() => {
        close();
        reject(new Error("Timed out waiting for Mercure updates."));
      }, timeoutMs);

      const close = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        eventSource.close();
      };

      eventSource.onopen = () => {
        options.onOpen?.();
        resolve({ close });
      };

      eventSource.onmessage = (event) => {
        const payload = parseMessage(event);
        if (payload != null) {
          options.onMessage?.(payload, event);
          if (options.shouldClose?.(payload, event)) {
            close();
            return;
          }
        }
        if (options.closeOnMessage) {
          close();
        }
      };

      eventSource.onerror = (error) => {
        options.onError?.(error);
        close();
        reject(new Error("Mercure stream disconnected before completion."));
      };
    });
  }

  return { subscribe };
}

export const useMercure = createMercureClient;
