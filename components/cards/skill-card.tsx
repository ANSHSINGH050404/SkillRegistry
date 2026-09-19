import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type SkillCardData = {
  slug: string;
  name: string;
  shortDescription: string;
  technologies: string[];
  agents: string[];
  installs?: number;
};

export function SkillCard({ skill }: { skill: SkillCardData }) {
  return (
    <Card>
      <CardTitle>
        <Link href={`/skills/${skill.slug}`} className="hover:underline">
          {skill.name}
        </Link>
      </CardTitle>
      <CardDescription className="mt-1">{skill.shortDescription}</CardDescription>
      <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Technologies">
        {skill.technologies.map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
      </div>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
        {skill.agents.join(" · ")}
      </p>
      <Link href={`/skills/${skill.slug}`} className="mt-3 inline-block text-sm font-medium underline-offset-4 hover:underline">
        View Skill
      </Link>
    </Card>
  );
}
