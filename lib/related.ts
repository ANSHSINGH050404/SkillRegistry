import { prisma } from "./prisma";

export type RelatedSkill = {
  slug: string; name: string; shortDescription: string;
  technologies: string[]; agents: string[];
};

// shared-tech×3 + shared-cat×2 + shared-tags + shared-agents, limit 6.
export async function getRelatedSkills(skillId: string, limit = 6): Promise<RelatedSkill[]> {
  const base = await prisma.skill.findUnique({
    where: { id: skillId },
    select: {
      technologies: { select: { technologyId: true } },
      categories: { select: { categoryId: true } },
      tags: { select: { tagId: true } },
      agents: { select: { agentId: true } },
    },
  });
  if (!base) return [];
  const techIds = base.technologies.map((t) => t.technologyId);
  const catIds = base.categories.map((c) => c.categoryId);
  const tagIds = base.tags.map((t) => t.tagId);
  const agentIds = base.agents.map((a) => a.agentId);

  const candidates = await prisma.skill.findMany({
    where: { status: "PUBLISHED", id: { not: skillId } },
    take: 50,
    select: {
      id: true, slug: true, name: true, shortDescription: true,
      technologies: { select: { technologyId: true, technology: { select: { name: true } } } },
      categories: { select: { categoryId: true } },
      tags: { select: { tagId: true } },
      agents: { select: { agentId: true, agent: { select: { name: true } } } },
    },
  });

  return candidates
    .map((c) => {
      const sharedTech = c.technologies.filter((t) => techIds.includes(t.technologyId)).length;
      const sharedCat = c.categories.filter((x) => catIds.includes(x.categoryId)).length;
      const sharedTag = c.tags.filter((x) => tagIds.includes(x.tagId)).length;
      const sharedAgent = c.agents.filter((x) => agentIds.includes(x.agentId)).length;
      return { c, score: sharedTech * 3 + sharedCat * 2 + sharedTag + sharedAgent };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ c }) => ({
      slug: c.slug, name: c.name, shortDescription: c.shortDescription,
      technologies: c.technologies.map((t) => t.technology.name),
      agents: c.agents.map((a) => a.agent.name),
    }));
}
