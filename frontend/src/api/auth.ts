import { apiRequest } from "./client";
import type { User } from "../types";

interface TokenResponse {
  access_token: string;
  token_type: string;
}

export function signup(email: string, password: string): Promise<User> {
  return apiRequest<User>("/auth/signup", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export function login(email: string, password: string): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/auth/login", {
    method: "POST",
    form: { username: email, password },
    auth: false,
  });
}

export function getCurrentUser(): Promise<User> {
  return apiRequest<User>("/auth/me");
}
