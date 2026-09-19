import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SkillCard } from "@/components/cards/skill-card";

export const revalidate = 300;

export default async function AgentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let agent = null;
  try {
    agent = await prisma.agent.findUnique({
      where: { slug },
      include: { skills: { include: { skill: { include: { technologies: { include: { technology: true } }, agents: { include: { agent: true } } } } } } },
    });
  } catch { agent = null; }
  if (!agent) notFound();
  const skills = agent.skills.map((s) => s.skill).filter((s) => s.status === "PUBLISHED");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{agent.name} Skills</h1>
      {skills.length === 0 ? <p className="text-sm text-zinc-600">No published skills for {agent.name} yet.</p> : (
        <div className="grid gap-4 md:grid-cols-3">
          {skills.map((s) => (
            <SkillCard key={s.slug} skill={{ slug: s.slug, name: s.name, shortDescription: s.shortDescription, technologies: s.technologies.map((t) => t.technology.name), agents: s.agents.map((a) => a.agent.name) }} />
          ))}
        </div>
      )}
    </div>
  );
}
