import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AgentsPage() {
  let agents: Array<{ slug: string; name: string }> = [];
  try { agents = await prisma.agent.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }); }
  catch { agents = []; }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Agents</h1>
      {agents.length === 0 ? <p className="text-sm text-zinc-600">Agents appear after seeding.</p> : (
        <ul className="grid gap-2 md:grid-cols-3">
          {agents.map((a) => <li key={a.slug}><Link className="underline-offset-4 hover:underline" href={`/agents/${a.slug}`}>{a.name}</Link></li>)}
        </ul>
      )}
    </div>
  );
}
