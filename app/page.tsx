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
    <div className="space-y-12 font-mono">
      <section aria-labelledby="hero" className="overflow-hidden rounded-lg border border-hairline bg-surface">
        <div className="flex items-center gap-2 border-b border-hairline px-4 py-2" aria-hidden="true">
          <span className="inline-block h-3 w-3 rounded-full bg-muted opacity-40" />
          <span className="inline-block h-3 w-3 rounded-full bg-muted opacity-40" />
          <span className="inline-block h-3 w-3 rounded-full bg-muted opacity-40" />
          <span className="ml-2 text-xs font-medium text-muted">~/skills — zsh</span>
        </div>
        <div className="space-y-4 p-6">
          <p className="text-base font-medium text-muted">
            <span className="text-foreground">$</span> agent-skills search --all
          </p>
          <h1 id="hero" className="text-[38px] font-bold leading-[1.5] text-foreground">
            Discover skills for your AI coding agent.
          </h1>
          <p className="max-w-xl text-base font-medium leading-[1.5] text-muted">
            Find specialized skills for the tools and technologies you use every day.
            <span className="terminal-cursor ml-2" aria-hidden="true" />
          </p>
          <div className="max-w-xl">
            <SearchInput />
          </div>
        </div>
      </section>

      <section aria-labelledby="trending">
        <h2 id="trending" className="font-mono text-xl font-bold leading-[1.5] text-foreground">$ trending --skills</h2>
        {trending.length === 0 ? (
          <p className="mt-2 font-mono text-base font-medium text-muted">
            No skills yet. Try browsing technologies or check back after seeding.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-3">
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
        <h2 id="techs" className="font-mono text-xl font-bold leading-[1.5] text-foreground">$ ls technologies/</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {technologies.length === 0 ? (
            <p className="font-mono text-base font-medium text-muted">Technologies appear after seeding.</p>
          ) : technologies.map((t) => (
            <Link key={t.slug} href={`/technologies/${t.slug}`} className="rounded-full border border-hairline px-3 py-1 font-mono text-base font-medium text-muted transition-colors duration-150 ease-terminal hover:text-foreground">
              {t.name}
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="cats">
        <h2 id="cats" className="font-mono text-xl font-bold leading-[1.5] text-foreground">$ ls categories/</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.length === 0 ? (
            <p className="font-mono text-base font-medium text-muted">Categories appear after seeding.</p>
          ) : categories.map((c) => (
            <Link key={c.slug} href={`/categories/${c.slug}`} className="rounded-full border border-hairline px-3 py-1 font-mono text-base font-medium text-muted transition-colors duration-150 ease-terminal hover:text-foreground">
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="recent">
        <h2 id="recent" className="font-mono text-xl font-bold leading-[1.5] text-foreground">$ recent --skills</h2>
        {recent.length === 0 ? (
          <p className="mt-2 font-mono text-base font-medium text-muted">Nothing here yet.</p>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-3">
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

      <section aria-labelledby="authors" className="rounded-md border border-hairline bg-surface p-8">
        <h2 id="authors" className="font-mono text-xl font-bold leading-[1.5] text-foreground">$ publish --skill</h2>
        <p className="mt-2 font-mono text-base font-medium leading-[1.5] text-muted">
          Publish your skill and make it discoverable by developers using AI coding agents.
        </p>
        <Button asChild className="mt-6">
          <Link href="/submit">Submit a Skill</Link>
        </Button>
      </section>
    </div>
  );
}
