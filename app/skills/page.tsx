import { SkillCard } from "@/components/cards/skill-card";
import { SearchInput } from "@/components/search/search-input";
import { searchParamsSchema } from "@/lib/validation";
import { searchSkills } from "@/lib/search";

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) if (typeof v === "string") flat[k] = v;
  const parsed = searchParamsSchema.safeParse(flat);
  const q = parsed.success ? parsed.data.q : "";
  let items: Awaited<ReturnType<typeof searchSkills>>["items"] = [];
  let nextCursor: string | null = null;
  if (parsed.success) {
    try {
      const res = await searchSkills(parsed.data);
      items = res.items; nextCursor = res.nextCursor;
    } catch { items = []; }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Skills{q ? ` for “${q}”` : ""}</h1>
      <div className="max-w-xl"><SearchInput defaultValue={q} /></div>
      {items.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <p className="font-medium">No skills found{q ? ` for “${q}”` : ""}.</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>Try another search term</li>
            <li>Browse technologies</li>
            <li>Browse categories</li>
          </ul>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((s) => (
            <SkillCard key={s.slug} skill={{
              slug: s.slug, name: s.name, shortDescription: s.shortDescription,
              technologies: s.technologies,
              agents: s.agents,
            }} />
          ))}
        </div>
      )}
      {nextCursor && <p className="text-xs text-zinc-500">More results available (cursor pagination).</p>}
    </div>
  );
}
