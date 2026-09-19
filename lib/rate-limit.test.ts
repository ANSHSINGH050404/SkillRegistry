import { describe, it, expect, vi, afterEach } from "vitest";
import { checkRateLimit } from "./rate-limit";

afterEach(() => {
  vi.useRealTimers();
});

describe("checkRateLimit", () => {
  it("allows up to the limit then blocks", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const key = `test-allow-${Math.random()}`;
    expect(checkRateLimit(key, { limit: 2, windowMs: 60_000 }).ok).toBe(true);
    expect(checkRateLimit(key, { limit: 2, windowMs: 60_000 }).ok).toBe(true);
    const blocked = checkRateLimit(key, { limit: 2, windowMs: 60_000 });
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
  });
  it("resets after the window passes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000_000);
    const key = `test-reset-${Math.random()}`;
    checkRateLimit(key, { limit: 1, windowMs: 60_000 });
    expect(checkRateLimit(key, { limit: 1, windowMs: 60_000 }).ok).toBe(false);
    vi.setSystemTime(1_000_000 + 60_001);
    expect(checkRateLimit(key, { limit: 1, windowMs: 60_000 }).ok).toBe(true);
  });
  it("tracks keys independently", () => {
    vi.useFakeTimers();
    vi.setSystemTime(2_000_000);
    const a = `test-a-${Math.random()}`;
    const b = `test-b-${Math.random()}`;
    checkRateLimit(a, { limit: 1, windowMs: 60_000 });
    expect(checkRateLimit(a, { limit: 1, windowMs: 60_000 }).ok).toBe(false);
    expect(checkRateLimit(b, { limit: 1, windowMs: 60_000 }).ok).toBe(true);
  });
});
