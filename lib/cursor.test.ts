import { describe, it, expect } from "vitest";
import {
  encodeCursor,
  decodeCursor,
  buildCursorFilter,
  type CursorPayload,
} from "./cursor";

const full: CursorPayload = {
  sort: "popular",
  id: "abc123",
  featured: true,
  githubStars: 42,
  updatedAt: "2026-09-01T00:00:00.000Z",
  createdAt: "2026-08-01T00:00:00.000Z",
};

describe("cursor round-trip", () => {
  it("encodes and decodes every sort mode", () => {
    for (const sort of ["relevance", "popular", "recent", "updated"] as const) {
      const decoded = decodeCursor(encodeCursor({ ...full, sort }));
      expect(decoded).toMatchObject({ sort, id: "abc123" });
    }
  });
  it("rejects malformed input", () => {
    expect(decodeCursor("!!!not-base64!!!")).toBeNull();
    expect(decodeCursor("")).toBeNull();
    expect(decodeCursor(undefined)).toBeNull();
    expect(decodeCursor(encodeCursor({ sort: "popular", id: "" }))).toBeNull();
    expect(decodeCursor(encodeCursor({ ...full, sort: "bogus" as never }))).toBeNull();
    expect(decodeCursor(encodeCursor({ sort: "popular", id: "x" }))).toBeNull(); // missing keys
    expect(decodeCursor("x".repeat(501))).toBeNull();
  });
});

describe("buildCursorFilter", () => {
  it("builds keyset ORs for recent", () => {
    const f = buildCursorFilter("recent", {
      sort: "recent",
      id: "x",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    expect(f).toEqual({
      OR: [
        { createdAt: { lt: "2026-01-01T00:00:00.000Z" } },
        { createdAt: { equals: "2026-01-01T00:00:00.000Z" }, id: { gt: "x" } },
      ],
    });
  });
  it("chains composite keys for popular", () => {
    const f = buildCursorFilter("popular", full);
    const ors = (f as { OR: unknown[] }).OR;
    expect(ors).toHaveLength(4);
    expect(ors[3]).toEqual({
      featured: { equals: true },
      githubStars: { equals: 42 },
      updatedAt: { equals: "2026-09-01T00:00:00.000Z" },
      id: { gt: "abc123" },
    });
  });
  it("skips the unmatchable featured=false branch", () => {
    const f = buildCursorFilter("relevance", {
      sort: "relevance",
      id: "x",
      featured: false,
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    const ors = (f as { OR: unknown[] }).OR;
    expect(ors).toHaveLength(2);
    expect(ors[0]).toEqual({ featured: { equals: false }, updatedAt: { lt: "2026-01-01T00:00:00.000Z" } });
  });
});
