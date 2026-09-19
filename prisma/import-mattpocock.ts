/**
 * One-shot import of the mattpocock/skills collection (38 SKILL.md files).
 *
 * Source: https://github.com/mattpocock/skills/tree/main/skills
 * - frontmatter `description` -> shortDescription (truncated to 280)
 * - markdown body            -> description + readme
 * - status PUBLISHED, verification COMMUNITY (third-party source, per trust policy Q5)
 * - per-skill GitHub metrics stay 0 (repo-level stars must not imply per-skill popularity)
 * - tags: source folder (engineering|in-progress|misc|productivity) + `mattpocock`
 * - categories: only where unambiguous (see CATEGORY_MAP)
 * - agents: all 5 seeded agents (plain SKILL.md = cross-agent standard)
 *
 * Usage: pnpm exec tsx prisma/import-mattpocock.ts
 * Requires: DATABASE_URL (pooled is fine), GITHUB_TOKEN (rate limits; anonymous works for 39 reqs)
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, SkillStatus, Verification } from "../generated/prisma/client";
import { slugify } from "../lib/slug";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "postgresql://localhost:5432/postgres",
});
const prisma = new PrismaClient({ adapter });

const OWNER = "mattpocock";
const REPO = "skills";
const REPO_URL = `https://github.com/${OWNER}/${REPO}`;
const FOLDERS = ["engineering", "in-progress", "misc", "productivity"];

// folder/skill -> Category names (seeded taxonomy). Only unambiguous mappings.
const CATEGORY_MAP: Record<string, string[]> = {
  "engineering/tdd": ["Testing"],
  "engineering/diagnosing-bugs": ["Testing"],
  "engineering/code-review": ["Testing"],
  "misc/git-guardrails-claude-code": ["Git"],
  "engineering/resolving-merge-conflicts": ["Git"],
  "misc/setup-pre-commit": ["Git"],
};

type Frontmatter = { name: string; description: string; body: string };

function parseSkillMd(raw: string): Frontmatter | null {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw.trim());
  if (!m) return null;
  const meta: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  if (!meta.name) return null;
  return { name: meta.name, description: meta.description ?? "", body: m[2].trim() };
}

async function gh(path: string): Promise<unknown> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "SkillRegistry",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${path}`);
  return res.json();
}

async function main() {
  // 1. Discover SKILL.md files via git tree (single request)
  const tree = (await gh(`/repos/${OWNER}/${REPO}/git/trees/main?recursive=1`)) as {
    tree: Array<{ path: string; type: string }>;
  };
  const skillFiles = tree.tree
    .filter((n) => n.type === "blob" && /^skills\/.+\/SKILL\.md$/.test(n.path))
    .filter((n) => FOLDERS.includes(n.path.split("/")[1]))
    .map((n) => n.path);
  console.log(`Discovered ${skillFiles.length} SKILL.md files.`);

  const agents = await prisma.agent.findMany({ select: { id: true } });
  const tagCache = new Map<string, string>();
  async function tagId(name: string): Promise<string> {
    const hit = tagCache.get(name);
    if (hit) return hit;
    const slug = slugify(name);
    const t = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
      select: { id: true },
    });
    tagCache.set(name, t.id);
    return t.id;
  }
  const catCache = new Map<string, string>();
  async function catId(name: string): Promise<string> {
    const hit = catCache.get(name);
    if (hit) return hit;
    const slug = slugify(name);
    const c = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
      select: { id: true },
    });
    catCache.set(name, c.id);
    return c.id;
  }

  let imported = 0;
  for (const file of skillFiles) {
    const [, folder, skillDir] = file.split("/");
    const key = `${folder}/${skillDir}`;
    // 2. Fetch raw SKILL.md (contents API, base64)
    const fileJson = (await gh(
      `/repos/${OWNER}/${REPO}/contents/${file}?ref=main`
    )) as { content: string };
    const raw = Buffer.from(fileJson.content, "base64").toString("utf8");
    const parsed = parseSkillMd(raw);
    if (!parsed) {
      console.log(`SKIP (no frontmatter): ${file}`);
      continue;
    }
    const slug = slugify(parsed.name);
    if (!slug) {
      console.log(`SKIP (bad slug): ${file}`);
      continue;
    }
    const shortDescription =
      parsed.description.length > 280 ? parsed.description.slice(0, 277) + "…" : parsed.description;

    const folderTag = await tagId(folder);
    const sourceTag = await tagId("mattpocock");
    const collectionCat = await catId("Matt Pocock");
    const cats = CATEGORY_MAP[key] ?? [];
    const catIds: string[] = [collectionCat];
    for (const c of cats) {
      const id = await catId(c);
      if (!catIds.includes(id)) catIds.push(id);
    }

    await prisma.skill.upsert({
      where: { slug },
      update: {
        name: parsed.name,
        shortDescription,
        description: parsed.body,
        readme: parsed.body,
        repositoryUrl: REPO_URL,
        sourceUrl: `https://github.com/${OWNER}/${REPO}/blob/main/${file}`,
        installCommand: `npx skills add ${slug}`,
        status: SkillStatus.PUBLISHED,
        verification: Verification.COMMUNITY,
      },
      create: {
        name: parsed.name,
        slug,
        shortDescription,
        description: parsed.body,
        readme: parsed.body,
        repositoryUrl: REPO_URL,
        sourceUrl: `https://github.com/${OWNER}/${REPO}/blob/main/${file}`,
        installCommand: `npx skills add ${slug}`,
        status: SkillStatus.PUBLISHED,
        verification: Verification.COMMUNITY,
        githubStars: 0,
        githubForks: 0,
        githubIssues: 0,
        tags: { create: [{ tagId: folderTag }, { tagId: sourceTag }] },
        categories: { create: catIds.map((categoryId) => ({ categoryId })) },
        agents: { create: agents.map((a) => ({ agentId: a.id })) },
      },
    });
    imported++;
    console.log(`OK: ${slug} (${key})`);
  }
  console.log(`Imported ${imported}/${skillFiles.length} skills.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
