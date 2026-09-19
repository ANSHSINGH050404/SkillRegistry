import { prisma } from "@/lib/prisma";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "PENDING_REVIEW" } = await searchParams;
  const allowed = ["PENDING_REVIEW", "PUBLISHED", "REJECTED", "ARCHIVED"] as const;
  const current = (allowed as readonly string[]).includes(status) ? status : "PENDING_REVIEW";
  let skills: Array<{ id: string; slug: string; name: string; status: string; featured: boolean; verification: string; updatedAt: Date }> = [];
  try {
    skills = await prisma.skill.findMany({
      where: { status: current as never },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: { id: true, slug: true, name: true, status: true, featured: true, verification: true, updatedAt: true },
    });
  } catch { skills = []; }

  return (
    <div className="space-y-8 font-mono">
      <h1 className="font-mono text-[38px] font-bold leading-[1.5] text-foreground">$ admin --{current.toLowerCase()}</h1>
      <nav className="flex flex-wrap gap-4" aria-label="Moderation queues">
        {allowed.map((s) => (
          <a key={s} className={s === current ? "font-mono text-base font-bold text-foreground underline" : "font-mono text-base font-medium text-muted underline transition-colors duration-150 ease-terminal hover:text-foreground"} href={`/admin?status=${s}`}>{s}</a>
        ))}
      </nav>
      {skills.length === 0 ? (
        <p className="font-mono text-base font-medium text-muted">$ queue --empty (or database unreachable)</p>
      ) : (
        <ul className="space-y-3">
          {skills.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-3 rounded-md border border-hairline bg-surface p-4 font-mono text-base">
              <span className="font-bold text-foreground">{s.name}</span>
              <span className="font-medium text-muted">/{s.slug}</span>
              <span className="font-medium text-muted">{s.verification}{s.featured ? " · featured" : ""}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="font-mono text-xs font-medium text-muted"># approve / reject / feature / verify / archive / revalidate via /api/admin/* with ADMIN_SECRET</p>
    </div>
  );
}
