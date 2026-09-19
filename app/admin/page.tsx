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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin — {current}</h1>
      <nav className="flex gap-3 text-sm" aria-label="Moderation queues">
        {allowed.map((s) => (
          <a key={s} className={s === current ? "font-semibold underline" : "hover:underline"} href={`/admin?status=${s}`}>{s}</a>
        ))}
      </nav>
      {skills.length === 0 ? (
        <p className="text-sm text-zinc-600">Queue empty (or database unreachable).</p>
      ) : (
        <ul className="space-y-2">
          {skills.map((s) => (
            <li key={s.id} className="flex items-center gap-3 rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
              <span className="font-medium">{s.name}</span>
              <span className="text-zinc-500">/{s.slug}</span>
              <span className="text-zinc-500">{s.verification}{s.featured ? " · featured" : ""}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-zinc-500">Actions (approve / reject / feature / verify / archive / revalidate) via /api/admin/* with ADMIN_SECRET. Full buttons land with Phase 4 UI polish; queue + gate ship now.</p>
    </div>
  );
}
