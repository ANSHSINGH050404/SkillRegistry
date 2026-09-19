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
        <Link href={`/skills/${skill.slug}`} className="text-accent underline-offset-4 transition-opacity duration-150 ease-terminal hover:opacity-80 hover:underline">
          {skill.name}
        </Link>
      </CardTitle>
      <CardDescription className="mt-2">{skill.shortDescription}</CardDescription>
      <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
        {skill.technologies.map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
      </div>
      <p className="mt-3 font-mono text-xs font-medium text-muted">
        {skill.agents.join(" · ")}
      </p>
      <Link href={`/skills/${skill.slug}`} className="mt-4 inline-block font-mono text-base font-medium text-foreground underline underline-offset-4 transition-opacity duration-150 ease-terminal hover:opacity-80">
        $ view skill
      </Link>
    </Card>
  );
}
