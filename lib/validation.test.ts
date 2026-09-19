import { describe, it, expect } from "vitest";
import { searchParamsSchema, submissionSchema } from "./validation";

describe("searchParamsSchema", () => {
  it("defaults sort and limit", () => {
    const p = searchParamsSchema.parse({ q: "prisma" });
    expect(p.sort).toBe("relevance");
    expect(p.limit).toBe(24);
  });
  it("rejects oversized limit", () => {
    const p = searchParamsSchema.safeParse({ limit: "999" });
    expect(p.success).toBe(false);
  });
  it("parses verified=true strictly", () => {
    expect(searchParamsSchema.parse({ verified: "true" }).verified).toBe(true);
    expect(searchParamsSchema.parse({ verified: "1" }).verified).toBe(true);
  });
  it('treats verified=false and absent as no filter', () => {
    expect(searchParamsSchema.parse({ verified: "false" }).verified).toBeUndefined();
    expect(searchParamsSchema.parse({}).verified).toBeUndefined();
  });
});

describe("submissionSchema", () => {
  const base = {
    name: "Prisma Expert",
    shortDescription: "Specialized Prisma workflows for AI coding agents.",
    description: "Long enough description with more than twenty characters.",
    installCommand: "npx skills add prisma-expert",
  };
  it("accepts github repo URL", () => {
    const r = submissionSchema.safeParse({ ...base, repositoryUrl: "https://github.com/owner/repo" });
    expect(r.success).toBe(true);
  });
  it("rejects non-github repo", () => {
    const r = submissionSchema.safeParse({ ...base, repositoryUrl: "https://gitlab.com/owner/repo" });
    expect(r.success).toBe(false);
  });
  it("rejects arbitrary install commands", () => {
    const r = submissionSchema.safeParse({ ...base, installCommand: "rm -rf /" });
    expect(r.success).toBe(false);
  });
});
