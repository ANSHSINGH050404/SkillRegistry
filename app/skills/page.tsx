import { SkillCard } from "@/components/cards/skill-card";
import { SearchInput } from "@/components/search/search-input";
import { searchParamsSchema } from "@/lib/validation";
import { decodeCursor } from "@/lib/cursor";
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
      // A malformed/forged cursor restarts at the first page rather than
      // surfacing an empty error state (the API still 400s on direct misuse).
      const params = parsed.data.cursor && !decodeCursor(parsed.data.cursor)
        ? { ...parsed.data, cursor: undefined }
        : parsed.data;
      const res = await searchSkills(params);
      items = res.items; nextCursor = res.nextCursor;
    } catch { items = []; }
  }

  return (
    <div className="space-y-8 font-mono">
      <h1 className="font-mono text-[38px] font-bold leading-[1.5] text-foreground">skills/{q ? `?q=${q}` : ""}</h1>
      <div className="max-w-xl"><SearchInput defaultValue={q} /></div>
      {items.length === 0 ? (
        <div className="rounded-md border border-hairline bg-surface p-8">
          <p className="font-mono text-base font-bold text-foreground">$ search {q ? `[${q}]` : ""} → 0 results</p>
          <ul className="mt-4 list-disc pl-5 font-mono text-base font-medium text-muted">
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
      {nextCursor && <p className="font-mono text-xs font-medium text-muted">-- more results available (cursor pagination)</p>}
    </div>
  );
}
