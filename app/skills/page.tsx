import { prisma } from "@/lib/prisma";
import { SkillCard } from "@/components/cards/skill-card";
import { SearchInput } from "@/components/search/search-input";

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  let skills: Array<{
    slug: string; name: string; shortDescription: string;
    technologies: Array<{ technology: { name: string } }>;
    agents: Array<{ agent: { name: string } }>;
  }> = [];
  try {
    skills = await prisma.skill.findMany({
      where: {
        status: "PUBLISHED",
        ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] } : {}),
      },
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
      take: 24,
      select: {
        slug: true, name: true, shortDescription: true,
        technologies: { select: { technology: { select: { name: true } } } },
        agents: { select: { agent: { select: { name: true } } } },
      },
    });
  } catch {
    skills = [];
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Skills{q ? ` for “${q}”` : ""}</h1>
      <div className="max-w-xl"><SearchInput defaultValue={q} /></div>
      {skills.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <p className="font-medium">No skills found{q ? ` for “${q}”` : ""}.</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>Try another search term</li>
            <li>Browse technologies</li>
            <li>Browse categories</li>
          </ul>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {skills.map((s) => (
            <SkillCard key={s.slug} skill={{
              slug: s.slug, name: s.name, shortDescription: s.shortDescription,
              technologies: s.technologies.map((t) => t.technology.name),
              agents: s.agents.map((a) => a.agent.name),
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
