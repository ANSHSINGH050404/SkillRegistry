import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function TechnologiesPage() {
  let techs: Array<{ slug: string; name: string }> = [];
  try {
    techs = await prisma.technology.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } });
  } catch { techs = []; }
  return (
    <div className="space-y-8 font-mono">
      <h1 className="font-mono text-[38px] font-bold leading-[1.5] text-foreground">$ ls technologies/</h1>
      {techs.length === 0 ? <p className="font-mono text-base font-medium text-muted">Technologies appear after seeding.</p> : (
        <ul className="grid gap-3 md:grid-cols-3">
          {techs.map((t) => <li key={t.slug} className="rounded-md border border-hairline bg-surface p-4 transition-colors duration-150 ease-terminal"><Link className="font-mono text-base font-medium text-accent underline underline-offset-4 transition-opacity duration-150 ease-terminal hover:opacity-80" href={`/technologies/${t.slug}`}>{t.name}</Link></li>)}
        </ul>
      )}
    </div>
  );
}
