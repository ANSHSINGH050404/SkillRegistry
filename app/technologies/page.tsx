import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function TechnologiesPage() {
  let techs: Array<{ slug: string; name: string }> = [];
  try {
    techs = await prisma.technology.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } });
  } catch { techs = []; }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Technologies</h1>
      {techs.length === 0 ? <p className="text-sm text-zinc-600">Technologies appear after seeding.</p> : (
        <ul className="grid gap-2 md:grid-cols-3">
          {techs.map((t) => <li key={t.slug}><Link className="underline-offset-4 hover:underline" href={`/technologies/${t.slug}`}>{t.name}</Link></li>)}
        </ul>
      )}
    </div>
  );
}
