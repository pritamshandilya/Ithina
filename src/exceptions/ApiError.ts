export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly data?: unknown;

  constructor(
    status: number,
    statusText: string,
    message: string,
    data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}
