import { z } from "zod";

export const searchParamsSchema = z.object({
  q: z.string().trim().max(200).optional().default(""),
  agent: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
  technology: z.string().trim().max(100).optional(),
  tag: z.string().trim().max(100).optional(),
  verified: z.coerce.boolean().optional(),
  sort: z.enum(["relevance", "popular", "recent", "updated"]).optional().default("relevance"),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(24),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

const githubRepoPattern = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/;
const installCommandPattern = /^(npx|npm|pnpm|bun|yarn)\s+[\w@\/:.\-]+(\s+[\w@\/:.\-]+)*$/;

export const submissionSchema = z.object({
  name: z.string().trim().min(2).max(80),
  shortDescription: z.string().trim().min(10).max(280),
  description: z.string().trim().min(20).max(8000),
  repositoryUrl: z.string().trim().url().regex(githubRepoPattern, "Must be a github.com/<owner>/<repo> URL").optional().or(z.literal("")),
  homepageUrl: z.string().trim().url().optional().or(z.literal("")),
  installCommand: z.string().trim().min(3).max(300).regex(installCommandPattern, "Must look like: npx skills add <slug>"),
  author: z.string().trim().min(1).max(80).optional().default(""),
  technologies: z.array(z.string().trim().min(1).max(80)).max(12).default([]),
  categories: z.array(z.string().trim().min(1).max(80)).max(8).default([]),
  agents: z.array(z.string().trim().min(1).max(80)).max(12).default([]),
  tags: z.array(z.string().trim().min(1).max(40)).max(16).default([]),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
