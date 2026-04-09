import type { Response } from "express";

const DEFAULT_STATUS_CODE_MAP: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  413: "PAYLOAD_TOO_LARGE",
  500: "INTERNAL_SERVER_ERROR",
};

export function sendErrorResponse(
  res: Response,
  status = 500,
  message = "Internal error",
  code?: string,
  extras?: Record<string, unknown>,
) {
  const payload: Record<string, unknown> = { message };
  payload.code = code ?? DEFAULT_STATUS_CODE_MAP[status] ?? "ERROR";
  if (extras) Object.assign(payload, extras);
  return res.status(status).json(payload);
}
