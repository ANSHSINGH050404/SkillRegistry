import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkillCard } from "@/components/cards/skill-card";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const skill = await prisma.skill.findUnique({ where: { slug }, select: { name: true, shortDescription: true } });
    if (!skill) return { title: "Skill not found | Agent Skills Directory" };
    return {
      title: `${skill.name} Agent Skill | Agent Skills Directory`,
      description: skill.shortDescription,
      alternates: { canonical: `/skills/${slug}` },
    };
  } catch {
    return { title: "Agent Skills Directory" };
  }
}

function capabilitiesFrom(skill: { description: string; tags: Array<{ tag: { name: string } }> }) {
  const fromTags = skill.tags.map((t) => t.tag.name);
  return fromTags.length > 0 ? fromTags : ["Workflows", "Best practices", "Debugging"];
}

export default async function SkillPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let skill = null;
  try {
    skill = await prisma.skill.findUnique({
      where: { slug },
      include: {
        technologies: { include: { technology: true } },
        agents: { include: { agent: true } },
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    });
  } catch {
    skill = null;
  }
  if (!skill || skill.status !== "PUBLISHED") notFound();

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: skill.name,
        description: skill.shortDescription,
        url: `${base}/skills/${skill.slug}`,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Skills", item: `${base}/skills` },
          { "@type": "ListItem", position: 2, name: skill.name, item: `${base}/skills/${skill.slug}` },
        ],
      },
    ],
  };

  let related: Array<{ slug: string; name: string; shortDescription: string; technologies: Array<{ technology: { name: string } }>; agents: Array<{ agent: { name: string } }> }> = [];
  try {
    const techIds = skill.technologies.map((t) => t.technologyId);
    related = await prisma.skill.findMany({
      where: { status: "PUBLISHED", slug: { not: skill.slug }, technologies: { some: { technologyId: { in: techIds } } } },
      take: 6,
      select: {
        slug: true, name: true, shortDescription: true,
        technologies: { select: { technology: { select: { name: true } } } },
        agents: { select: { agent: { select: { name: true } } } },
      },
    });
  } catch {
    related = [];
  }

  return (
    <article className="space-y-12 font-mono">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header>
        <p className="font-mono text-base font-medium text-muted">$ cat skills/{skill.slug}.md</p>
        <h1 className="mt-2 font-mono text-[38px] font-bold leading-[1.5] text-foreground">{skill.name}</h1>
        <p className="mt-2 max-w-xl font-mono text-base font-medium leading-[1.5] text-muted">{skill.shortDescription}</p>
        <div className="mt-6 flex gap-3">
          <form action={`/api/skills/${skill.id}/install`} method="post">
            <Button type="submit">$ install</Button>
          </form>
          {skill.repositoryUrl && (
            <Button variant="outline" asChild>
              <a href={skill.repositoryUrl} target="_blank" rel="noopener noreferrer">source →</a>
            </Button>
          )}
        </div>
      </header>

      <section aria-labelledby="what">
        <h2 id="what" className="font-mono text-xl font-bold leading-[1.5] text-foreground">## what-does-it-do</h2>
        <div className="mt-4 max-w-none font-mono text-base font-medium leading-[1.5] text-foreground">
          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{skill.description}</ReactMarkdown>
        </div>
      </section>

      <section aria-labelledby="caps">
        <h2 id="caps" className="font-mono text-xl font-bold leading-[1.5] text-foreground">## capabilities</h2>
        <ul className="mt-4 list-disc pl-5 font-mono text-base font-medium text-muted">
          {capabilitiesFrom(skill).map((c) => <li key={c}>{c}</li>)}
        </ul>
      </section>

      <section aria-labelledby="agents">
        <h2 id="agents" className="font-mono text-xl font-bold leading-[1.5] text-foreground">## compatible-agents</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {skill.agents.map((a) => <Badge key={a.agentId}>{a.agent.name}</Badge>)}
        </div>
      </section>

      <section aria-labelledby="techs">
        <h2 id="techs" className="font-mono text-xl font-bold leading-[1.5] text-foreground">## technologies</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {skill.technologies.map((t) => <Badge key={t.technologyId}>{t.technology.name}</Badge>)}
        </div>
      </section>

      <section aria-labelledby="install">
        <h2 id="install" className="font-mono text-xl font-bold leading-[1.5] text-foreground">## installation</h2>
        <pre className="mt-4 overflow-x-auto rounded-md border border-hairline bg-surface p-4 font-mono text-base font-medium text-foreground">{skill.installCommand}<span className="terminal-cursor ml-2" aria-hidden="true" /></pre>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related">
          <h2 id="related" className="font-mono text-xl font-bold leading-[1.5] text-foreground">## related-skills</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {related.map((r) => (
              <SkillCard key={r.slug} skill={{
                slug: r.slug, name: r.name, shortDescription: r.shortDescription,
                technologies: r.technologies.map((t) => t.technology.name),
                agents: r.agents.map((a) => a.agent.name),
              }} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
