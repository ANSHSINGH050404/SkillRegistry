import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
  let cats: Array<{ slug: string; name: string }> = [];
  try { cats = await prisma.category.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }); }
  catch { cats = []; }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Categories</h1>
      {cats.length === 0 ? <p className="text-sm text-zinc-600">Categories appear after seeding.</p> : (
        <ul className="grid gap-2 md:grid-cols-3">
          {cats.map((c) => <li key={c.slug}><Link className="underline-offset-4 hover:underline" href={`/categories/${c.slug}`}>{c.name}</Link></li>)}
        </ul>
      )}
    </div>
  );
}
