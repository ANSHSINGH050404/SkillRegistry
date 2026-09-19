import type { SearchParams } from "./validation";

export type SearchResult = {
  items: unknown[];
  nextCursor: string | null;
};

// Phase 3 implements PG FTS + pg_trgm. V1 abstraction keeps engine swappable.
export async function searchSkills(_params: SearchParams): Promise<SearchResult> {
  return { items: [], nextCursor: null };
}
