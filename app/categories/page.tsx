import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
  let cats: Array<{ slug: string; name: string }> = [];
  try { cats = await prisma.category.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }); }
  catch { cats = []; }
  return (
    <div className="space-y-8 font-mono">
      <h1 className="font-mono text-[38px] font-bold leading-[1.5] text-foreground">$ ls categories/</h1>
      {cats.length === 0 ? <p className="font-mono text-base font-medium text-muted">Categories appear after seeding.</p> : (
        <ul className="grid gap-3 md:grid-cols-3">
          {cats.map((c) => <li key={c.slug} className="rounded-md border border-hairline bg-surface p-4 transition-colors duration-150 ease-terminal"><Link className="font-mono text-base font-medium text-accent underline underline-offset-4 transition-opacity duration-150 ease-terminal hover:opacity-80" href={`/categories/${c.slug}`}>{c.name}</Link></li>)}
        </ul>
      )}
    </div>
  );
}
