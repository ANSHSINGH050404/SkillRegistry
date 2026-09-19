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
    <article className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{skill.name}</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">{skill.shortDescription}</p>
        <div className="mt-4 flex gap-2">
          <form action={`/api/skills/${skill.id}/install`} method="post">
            <Button type="submit">Install Skill</Button>
          </form>
          {skill.repositoryUrl && (
            <Button variant="outline" asChild>
              <a href={skill.repositoryUrl} target="_blank" rel="noopener noreferrer">Source</a>
            </Button>
          )}
        </div>
      </header>

      <section aria-labelledby="what">
        <h2 id="what" className="text-xl font-semibold">What does this skill do?</h2>
        <div className="prose mt-2 max-w-none text-sm dark:prose-invert">
          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{skill.description}</ReactMarkdown>
        </div>
      </section>

      <section aria-labelledby="caps">
        <h2 id="caps" className="text-xl font-semibold">Capabilities</h2>
        <ul className="mt-2 list-disc pl-5 text-sm">
          {capabilitiesFrom(skill).map((c) => <li key={c}>{c}</li>)}
        </ul>
      </section>

      <section aria-labelledby="agents">
        <h2 id="agents" className="text-xl font-semibold">Compatible Agents</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {skill.agents.map((a) => <Badge key={a.agentId}>{a.agent.name}</Badge>)}
        </div>
      </section>

      <section aria-labelledby="techs">
        <h2 id="techs" className="text-xl font-semibold">Technologies</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {skill.technologies.map((t) => <Badge key={t.technologyId}>{t.technology.name}</Badge>)}
        </div>
      </section>

      <section aria-labelledby="install">
        <h2 id="install" className="text-xl font-semibold">Installation</h2>
        <pre className="mt-2 overflow-x-auto rounded-md bg-zinc-100 p-3 text-sm dark:bg-zinc-900">{skill.installCommand}</pre>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related">
          <h2 id="related" className="text-xl font-semibold">Related Skills</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
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
