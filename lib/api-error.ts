import axios from "axios"

type ApiErrorBody = {
  message?: string
  error?: string
}

/**
 * Reads the user-facing message from a failed API response.
 * Backend shape: { message: "...", error: "..." } — prefers `error` when present.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback
  }

  const body = error.response?.data

  if (typeof body === "string" && body.trim()) {
    return body.trim()
  }

    if (body && typeof body === "object") {
      const { message, error: detail } = body as ApiErrorBody
      if (message?.trim()) return message.trim()
      if (detail?.trim()) return detail.trim()
    }

  if (error.response?.status === 401) {
    return "Your session has expired. Please log in again."
  }

  return fallback
}

/** Message from a rejected Redux async thunk (`rejectWithValue` payload). */
export function getThunkErrorMessage(payload: unknown, fallback: string): string {
  return typeof payload === "string" && payload.trim() ? payload : fallback
}
