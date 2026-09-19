type PopularityInput = {
  featured: boolean;
  githubStars: number;
  updatedAt: Date;
};

// V1 stub: deterministic simple sort. Weighted + time-decay lands post-MVP.
// Raw score is never exposed to clients.
export function calculateScore(input: PopularityInput): number {
  const featuredBoost = input.featured ? 1_000_000_000_000 : 0;
  const recencyBoost = Math.floor(input.updatedAt.getTime() / 3_600_000);
  return featuredBoost + input.githubStars * 1000 + recencyBoost;
}

export function sortByPopularity<T extends PopularityInput>(items: T[]): T[] {
  return [...items].sort((a, b) => calculateScore(b) - calculateScore(a));
}
