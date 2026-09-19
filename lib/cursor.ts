// Opaque composite keyset cursors for search pagination.
//
// Every list ordering ends in a unique `id ASC` tiebreaker, so a cursor that
// carries the last row's sort keys + id identifies an exact resume point:
// rows after the cursor are (k1 < c1) OR (k1 = c1 AND k2 < c2) OR ...
// (all keys sort DESC in every mode; `id` is the ASC tiebreaker).
//
// The cursor is opaque base64url JSON. Malformed input decodes to null and
// callers must reject it (API: 400) or drop it (pages: first page).

export type SortMode = "relevance" | "popular" | "recent" | "updated";

type Key = "featured" | "githubStars" | "updatedAt" | "createdAt";

const SORT_KEYS: Record<SortMode, Key[]> = {
  relevance: ["featured", "updatedAt"],
  popular: ["featured", "githubStars", "updatedAt"],
  recent: ["createdAt"],
  updated: ["updatedAt"],
};

const SORTS: SortMode[] = ["relevance", "popular", "recent", "updated"];

export function keysForSort(sort: SortMode): Key[] {
  return SORT_KEYS[sort] ?? SORT_KEYS.relevance;
}

export type CursorPayload = {
  sort: SortMode;
  id: string;
  featured?: boolean;
  githubStars?: number;
  updatedAt?: string;
  createdAt?: string;
};

function isKeyValue(key: Key, v: unknown): boolean {
  if (key === "featured") return typeof v === "boolean";
  return typeof v === "number" || typeof v === "string";
}

export function encodeCursor(p: CursorPayload): string {
  return Buffer.from(JSON.stringify(p), "utf8").toString("base64url");
}

export function decodeCursor(raw: unknown): CursorPayload | null {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 500) return null;
  try {
    const p = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as Partial<CursorPayload>;
    if (!p || typeof p !== "object" || typeof p.id !== "string" || !p.id) return null;
    if (!SORTS.includes(p.sort as SortMode)) return null;
    const sort = p.sort as SortMode;
    for (const k of keysForSort(sort)) {
      if (!isKeyValue(k, (p as Record<string, unknown>)[k])) return null;
    }
    return p as CursorPayload;
  } catch {
    return null;
  }
}

// Pure predicate builder (unit-testable; search.ts passes it straight to Prisma).
export function buildCursorFilter(sort: SortMode, cursor: CursorPayload): Record<string, unknown> {
  const keys = keysForSort(sort);
  const eq: Record<string, unknown> = {};
  const ors: Record<string, unknown>[] = [];
  for (const k of keys) {
    const v = (cursor as unknown as Record<string, unknown>)[k];
    // Under DESC ordering nothing sorts strictly after `false`, so that
    // branch would match zero rows — skip it, keep the equality for later terms.
    if (!(k === "featured" && v === false)) {
      ors.push({ ...eq, [k]: { lt: v } });
    }
    eq[k] = { equals: v };
  }
  ors.push({ ...eq, id: { gt: cursor.id } });
  return { OR: ors };
}
