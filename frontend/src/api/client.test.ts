import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiRequest, ApiError, setToken, clearToken } from "../api/client";

describe("apiRequest", () => {
  beforeEach(() => {
    clearToken();
    vi.restoreAllMocks();
  });

  it("attaches a bearer token when one is stored", async () => {
    setToken("test-token-123");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 1 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("/tasks");

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBe("Bearer test-token-123");
  });

  it("throws an ApiError with the server's detail message on failure", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ detail: "Task not found" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    try {
      await apiRequest("/tasks/999");
      expect.fail("expected apiRequest to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(404);
      expect((err as ApiError).message).toBe("Task not found");
    }
  });

  it("returns undefined for 204 No Content responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    vi.stubGlobal("fetch", fetchMock);

    const result = await apiRequest("/tasks/1");
    expect(result).toBeUndefined();
  });
});
