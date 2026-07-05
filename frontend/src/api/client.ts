const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const TOKEN_KEY = "task_tracker_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  form?: Record<string, string>;
  auth?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, form, auth = true } = options;
  const headers: Record<string, string> = {};

  let requestBody: BodyInit | undefined;
  if (form) {
    requestBody = new URLSearchParams(form);
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  } else if (body !== undefined) {
    requestBody = JSON.stringify(body);
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: requestBody,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      message = data.detail ?? message;
    } catch {
      // response had no JSON body; keep the default message
    }
    throw new ApiError(response.status, typeof message === "string" ? message : "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}
