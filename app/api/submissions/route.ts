import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { submissionSchema } from "@/lib/validation";
import { slugify } from "@/lib/slug";

async function ensureSlug(base: string): Promise<string> {
  let slug = slugify(base);
  if (!slug) slug = `skill-${Date.now()}`;
  let candidate = slug;
  for (let i = 1; i < 20; i++) {
    const existing = await prisma.skill.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing) return candidate;
    candidate = `${slug}-${i + 1}`;
  }
  return `${slug}-${Date.now()}`;
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = submissionSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "INVALID", message: "Invalid submission." } }, { status: 400 });
    }
    const d = parsed.data;
    const slug = await ensureSlug(d.name);

    const techIds: string[] = [];
    for (const name of d.technologies.slice(0, 12)) {
      const s = slugify(name);
      if (!s) continue;
      const t = await prisma.technology.upsert({
        where: { slug: s },
        update: {},
        create: { name: name.trim(), slug: s },
        select: { id: true },
      });
      techIds.push(t.id);
    }
    const catIds: string[] = [];
    for (const name of d.categories.slice(0, 8)) {
      const s = slugify(name);
      if (!s) continue;
      const c = await prisma.category.upsert({
        where: { slug: s },
        update: {},
        create: { name: name.trim(), slug: s },
        select: { id: true },
      });
      catIds.push(c.id);
    }
    const agentIds: string[] = [];
    for (const name of d.agents.slice(0, 12)) {
      const s = slugify(name);
      if (!s) continue;
      const a = await prisma.agent.upsert({
        where: { slug: s },
        update: {},
        create: { name: name.trim(), slug: s },
        select: { id: true },
      });
      agentIds.push(a.id);
    }
    const tagIds: string[] = [];
    for (const name of d.tags.slice(0, 16)) {
      const s = slugify(name.toLowerCase());
      if (!s) continue;
      const t = await prisma.tag.upsert({
        where: { slug: s },
        update: {},
        create: { name: name.trim().toLowerCase(), slug: s },
        select: { id: true },
      });
      tagIds.push(t.id);
    }

    const skill = await prisma.skill.create({
      data: {
        name: d.name.trim(),
        slug,
        shortDescription: d.shortDescription.trim(),
        description: d.description.trim(),
        repositoryUrl: d.repositoryUrl || null,
        homepageUrl: d.homepageUrl || null,
        installCommand: d.installCommand.trim(),
        status: "PENDING_REVIEW",
        verification: "COMMUNITY",
        technologies: { create: techIds.map((technologyId) => ({ technologyId })) },
        categories: { create: catIds.map((categoryId) => ({ categoryId })) },
        agents: { create: agentIds.map((agentId) => ({ agentId })) },
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
      },
      select: { id: true, slug: true },
    });
    return NextResponse.json({ ok: true, status: "PENDING_REVIEW", slug: skill.slug }, { status: 202 });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL", message: "Something went wrong." } }, { status: 500 });
  }
}
