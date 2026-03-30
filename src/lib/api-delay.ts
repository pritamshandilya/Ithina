/**
 * Simulates network latency for mock API functions.
 * Remove this file when all services are backed by real endpoints.
 */
export const apiDelay = (ms = 0): Promise<void> =>
  ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();
