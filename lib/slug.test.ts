import { describe, it, expect } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Prisma Expert")).toBe("prisma-expert");
  });
  it("strips diacritics and symbols", () => {
    expect(slugify("Better Auth!")).toBe("better-auth");
  });
  it("collapses dashes", () => {
    expect(slugify("  Next___js  ")).toBe("next-js");
  });
});
