import { describe, it, expect } from "vitest";
import { calculateScore } from "./popularity";

describe("calculateScore", () => {
  it("boosts featured over stars", () => {
    const a = calculateScore({ featured: true, githubStars: 0, updatedAt: new Date("2026-01-01") });
    const b = calculateScore({ featured: false, githubStars: 10000, updatedAt: new Date("2026-01-01") });
    expect(a).toBeGreaterThan(b);
  });
  it("prefers newer within same tier", () => {
    const oldS = calculateScore({ featured: false, githubStars: 10, updatedAt: new Date("2025-01-01") });
    const newS = calculateScore({ featured: false, githubStars: 10, updatedAt: new Date("2026-01-01") });
    expect(newS).toBeGreaterThan(oldS);
  });
});
