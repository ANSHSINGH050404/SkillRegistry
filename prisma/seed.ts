import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, SkillStatus, Verification } from "../generated/prisma/client";
import { slugify } from "../lib/slug";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "postgresql://localhost:5432/postgres",
});
const prisma = new PrismaClient({ adapter });

// All metrics intentionally 0/null: synthetic demo data, never fabricated popularity.
const TECHNOLOGIES = [
  "Next.js", "React", "Hono", "Prisma", "Drizzle",
  "Better Auth", "PostgreSQL", "Redis", "Effect", "LangGraph", "MCP", "Playwright",
];
const AGENTS = ["Claude Code", "OpenCode", "Codex", "Gemini CLI", "Cursor"];
const CATEGORIES = [
  "Framework", "Database", "ORM", "Authentication", "AI",
  "Testing", "DevOps", "Security", "Git", "Browser Automation",
];

const SKILLS = [
  { name: "Prisma Expert", short: "Specialized Prisma workflows for AI coding agents.", techs: ["Prisma", "PostgreSQL", "Next.js"] },
  { name: "Drizzle ORM Guide", short: "Drizzle schema, migrations and type-safe queries.", techs: ["Drizzle", "PostgreSQL"] },
  { name: "Better Auth Helper", short: "Auth flows, sessions and OAuth with Better Auth.", techs: ["Better Auth", "Next.js"] },
  { name: "Next.js Pro", short: "App Router, Server Components and caching patterns.", techs: ["Next.js", "React"] },
  { name: "Hono API Builder", short: "Lightweight Hono APIs and middleware.", techs: ["Hono"] },
  { name: "PostgreSQL Tuner", short: "Indexing, EXPLAIN and query optimization.", techs: ["PostgreSQL"] },
  { name: "Effect Patterns", short: "Effect-TS patterns for robust backends.", techs: ["Effect"] },
  { name: "MCP Server Starter", short: "Build and publish MCP servers.", techs: ["MCP"] },
  { name: "Playwright E2E", short: "Reliable E2E flows with Playwright.", techs: ["Playwright"] },
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
  const agents = await prisma.agent.findMany();
  const defaultCat = await prisma.category.findFirst();
  for (const s of SKILLS) {
    const slug = slugify(s.name);
    await prisma.skill.upsert({
      where: { slug },
      update: {},
      create: {
        name: s.name,
        slug,
        shortDescription: s.short,
        description: `${s.short} (synthetic seed — do not treat metrics as real).`,
        installCommand: `npx skills add ${slug}`,
        status: SkillStatus.PUBLISHED,
        verification: Verification.COMMUNITY,
        githubStars: 0,
        technologies: {
          create: (
            await prisma.technology.findMany({ where: { name: { in: s.techs } } })
          ).map((t) => ({ technologyId: t.id })),
        },
        categories: defaultCat ? { create: [{ categoryId: defaultCat.id }] } : undefined,
        agents: { create: agents.slice(0, 3).map((a) => ({ agentId: a.id })) },
      },
    });
  }
  console.log("Seed complete (synthetic, all metrics zero).");
}

main().finally(() => prisma.$disconnect());
