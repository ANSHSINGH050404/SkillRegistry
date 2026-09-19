import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AgentsPage() {
  let agents: Array<{ slug: string; name: string }> = [];
  try { agents = await prisma.agent.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }); }
  catch { agents = []; }
  return (
    <div className="space-y-8 font-mono">
      <h1 className="font-mono text-[38px] font-bold leading-[1.5] text-foreground">$ ls agents/</h1>
      {agents.length === 0 ? <p className="font-mono text-base font-medium text-muted">Agents appear after seeding.</p> : (
        <ul className="grid gap-3 md:grid-cols-3">
          {agents.map((a) => <li key={a.slug} className="rounded-md border border-hairline bg-surface p-4 transition-colors duration-150 ease-terminal"><Link className="font-mono text-base font-medium text-accent underline underline-offset-4 transition-opacity duration-150 ease-terminal hover:opacity-80" href={`/agents/${a.slug}`}>{a.name}</Link></li>)}
        </ul>
      )}
    </div>
  );
}
