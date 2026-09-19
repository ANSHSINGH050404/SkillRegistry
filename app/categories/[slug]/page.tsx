import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SkillCard } from "@/components/cards/skill-card";

export const revalidate = 300;

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let cat = null;
  try {
    cat = await prisma.category.findUnique({
      where: { slug },
      include: { skills: { include: { skill: { include: { technologies: { include: { technology: true } }, agents: { include: { agent: true } } } } } } },
    });
  } catch { cat = null; }
  if (!cat) notFound();
  const skills = cat.skills.map((s) => s.skill).filter((s) => s.status === "PUBLISHED");
  return (
    <div className="space-y-8 font-mono">
      <p className="font-mono text-base font-medium text-muted">$ cat categories/{cat.slug}.md</p>
      <h1 className="font-mono text-[38px] font-bold leading-[1.5] text-foreground">{cat.name}</h1>
      {cat.description && <p className="max-w-xl font-mono text-base font-medium leading-[1.5] text-muted">{cat.description}</p>}
      {skills.length === 0 ? <p className="font-mono text-base font-medium text-muted">$ search [{cat.name}] → 0 results. Try another term.</p> : (
        <div className="grid gap-6 md:grid-cols-3">
          {skills.map((s) => (
            <SkillCard key={s.slug} skill={{ slug: s.slug, name: s.name, shortDescription: s.shortDescription, technologies: s.technologies.map((t) => t.technology.name), agents: s.agents.map((a) => a.agent.name) }} />
          ))}
        </div>
      )}
    </div>
  );
}
