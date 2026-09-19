import { prisma } from "./prisma";
import type { SearchParams } from "./validation";

export type SearchItem = {
  slug: string;
  name: string;
  shortDescription: string;
  technologies: string[];
  agents: string[];
  updatedAt: string;
  id: string;
};

export type SearchResult = {
  items: SearchItem[];
  nextCursor: string | null;
};

// Abstraction boundary: swap engine later without touching pages/API.
// V1: Postgres ILIKE + relation matches + pg_trgm-ready ordering.
// FTS tsvector/GIN lands via migration SQL (prisma/migrations/*_search).
export async function searchSkills(params: SearchParams): Promise<SearchResult> {
  const limit = Math.min(Math.max(params.limit ?? 24, 1), 50);
  const q = (params.q ?? "").trim();

  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (params.verified) {
    (where as Record<string, unknown>).verification = "VERIFIED";
  }
  const and: Record<string, unknown>[] = [];
  if (q) {
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { shortDescription: { contains: q, mode: "insensitive" } },
        { technologies: { some: { technology: { name: { contains: q, mode: "insensitive" } } } } },
        { categories: { some: { category: { name: { contains: q, mode: "insensitive" } } } } },
        { agents: { some: { agent: { name: { contains: q, mode: "insensitive" } } } } },
        { tags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
      ],
    });
  }
  if (params.technology) {
    and.push({ technologies: { some: { technology: { slug: params.technology } } } });
  }
  if (params.category) {
    and.push({ categories: { some: { category: { slug: params.category } } } });
  }
  if (params.agent) {
    and.push({ agents: { some: { agent: { slug: params.agent } } } });
  }
  if (params.tag) {
    and.push({ tags: { some: { tag: { slug: params.tag } } } });
  }
  if (and.length > 0) (where as Record<string, unknown>).AND = and;

  const sort = params.sort ?? "relevance";
  const orderBy =
    sort === "popular"
      ? [{ featured: "desc" as const }, { githubStars: "desc" as const }, { updatedAt: "desc" as const }]
      : sort === "recent"
        ? [{ createdAt: "desc" as const }]
        : sort === "updated"
          ? [{ updatedAt: "desc" as const }]
          : [{ featured: "desc" as const }, { updatedAt: "desc" as const }];

  const cursorClause = params.cursor
    ? { id: { gt: params.cursor } }
    : {};
  const mergedWhere = { ...where, ...cursorClause };

  const rows = await prisma.skill.findMany({
    where: mergedWhere as never,
    orderBy,
    take: limit + 1,
    select: {
      id: true, slug: true, name: true, shortDescription: true, updatedAt: true,
      technologies: { select: { technology: { select: { name: true } } } },
      agents: { select: { agent: { select: { name: true } } } },
    },
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  return {
    items: page.map((r) => ({
      id: r.id, slug: r.slug, name: r.name, shortDescription: r.shortDescription,
      technologies: r.technologies.map((t) => t.technology.name),
      agents: r.agents.map((a) => a.agent.name),
      updatedAt: r.updatedAt.toISOString(),
    })),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}
