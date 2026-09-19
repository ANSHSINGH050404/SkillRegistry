type RepoMeta = {
  stars: number;
  forks: number;
  issues: number;
  description: string | null;
  defaultBranch: string | null;
  lastUpdated: string | null;
  license: string | null;
  owner: string | null;
};

// On-demand server fetch only (Phase 4). Failures must never block publish.
export async function fetchRepoMeta(_repoUrl: string): Promise<RepoMeta | null> {
  return null;
}
