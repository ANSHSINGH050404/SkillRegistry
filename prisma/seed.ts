import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { slugify } from "../lib/slug";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "postgresql://localhost:5432/postgres",
});
const prisma = new PrismaClient({ adapter });

// Taxonomy only. Skills come from real sources — see prisma/import-mattpocock.ts.
// (The original 9 synthetic demo skills were removed; this seed must not recreate them.)
const TECHNOLOGIES = [
  "Next.js", "React", "Hono", "Prisma", "Drizzle",
  "Better Auth", "PostgreSQL", "Redis", "Effect", "LangGraph", "MCP", "Playwright",
];
const AGENTS = ["Claude Code", "OpenCode", "Codex", "Gemini CLI", "Cursor"];
const CATEGORIES = [
  "Framework", "Database", "ORM", "Authentication", "AI",
  "Testing", "DevOps", "Security", "Git", "Browser Automation",
];

async function main() {
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: slugify(c) },
      update: {},
      create: { name: c, slug: slugify(c), description: `${c} skills.` },
    });
  }
  for (const a of AGENTS) {
    await prisma.agent.upsert({
      where: { slug: slugify(a) },
      update: {},
      create: { name: a, slug: slugify(a), description: `Skills compatible with ${a}.` },
    });
  }
  for (const t of TECHNOLOGIES) {
    await prisma.technology.upsert({
      where: { slug: slugify(t) },
      update: {},
      create: { name: t, slug: slugify(t), description: `${t} skills for AI coding agents.` },
    });
  }
  console.log("Seed complete (taxonomy only; skills come from real imports).");
}

main().finally(() => prisma.$disconnect());
