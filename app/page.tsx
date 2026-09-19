import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SkillCard } from "@/components/cards/skill-card";
import { SearchInput } from "@/components/search/search-input";
import { Button } from "@/components/ui/button";

export const revalidate = 300;

async function getHomeData() {
  try {
    const [trending, technologies, categories, recent] = await Promise.all([
      prisma.skill.findMany({
        where: { status: "PUBLISHED" },
        orderBy: [{ featured: "desc" }, { githubStars: "desc" }, { updatedAt: "desc" }],
        take: 6,
        select: {
          slug: true, name: true, shortDescription: true,
          technologies: { select: { technology: { select: { name: true } } } },
          agents: { select: { agent: { select: { name: true } } } },
        },
      }),
      prisma.technology.findMany({ take: 12, select: { slug: true, name: true } }),
      prisma.category.findMany({ take: 10, select: { slug: true, name: true } }),
      prisma.skill.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          slug: true, name: true, shortDescription: true,
          technologies: { select: { technology: { select: { name: true } } } },
          agents: { select: { agent: { select: { name: true } } } },
        },
      }),
    ]);
    return { trending, technologies, categories, recent };
  } catch {
    return { trending: [], technologies: [], categories: [], recent: [] };
  }
}

export default async function Home() {
  const { trending, technologies, categories, recent } = await getHomeData();
  return (
    <div className="space-y-12">
      <section aria-labelledby="hero">
        <h1 id="hero" className="text-3xl font-semibold tracking-tight">
          Discover skills for your AI coding agent.
        </h1>
        <p className="mt-2 max-w-xl text-zinc-600 dark:text-zinc-400">
          Find specialized skills for the tools and technologies you use every day.
        </p>
        <div className="mt-4 max-w-xl">
          <SearchInput />
        </div>
      </section>

      <section aria-labelledby="trending">
        <h2 id="trending" className="text-xl font-semibold">Trending Skills</h2>
        {trending.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            No skills yet. Try browsing technologies or check back after seeding.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {trending.map((s) => (
              <SkillCard key={s.slug} skill={{
                slug: s.slug, name: s.name, shortDescription: s.shortDescription,
                technologies: s.technologies.map((t) => t.technology.name),
                agents: s.agents.map((a) => a.agent.name),
              }} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="techs">
        <h2 id="techs" className="text-xl font-semibold">Popular Technologies</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {technologies.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Technologies appear after seeding.</p>
          ) : technologies.map((t) => (
            <Link key={t.slug} href={`/technologies/${t.slug}`} className="rounded-full border border-zinc-200 px-3 py-1 text-sm hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900">
              {t.name}
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="cats">
        <h2 id="cats" className="text-xl font-semibold">Browse by Category</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Categories appear after seeding.</p>
          ) : categories.map((c) => (
            <Link key={c.slug} href={`/categories/${c.slug}`} className="rounded-full border border-zinc-200 px-3 py-1 text-sm hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900">
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="recent">
        <h2 id="recent" className="text-xl font-semibold">Recently Added Skills</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Nothing here yet.</p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {recent.map((s) => (
              <SkillCard key={s.slug} skill={{
                slug: s.slug, name: s.name, shortDescription: s.shortDescription,
                technologies: s.technologies.map((t) => t.technology.name),
                agents: s.agents.map((a) => a.agent.name),
              }} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="authors" className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 id="authors" className="text-xl font-semibold">For Skill Authors</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Publish your skill and make it discoverable by developers using AI coding agents.
        </p>
        <Button asChild className="mt-4">
          <Link href="/submit">Submit a Skill</Link>
        </Button>
      </section>
    </div>
  );
}
