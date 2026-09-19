export type RepoMeta = {
  stars: number;
  forks: number;
  issues: number;
  description: string | null;
  defaultBranch: string | null;
  lastUpdated: string | null;
  license: string | null;
  owner: string | null;
};

function parseRepo(repoUrl: string): { owner: string; repo: string } | null {
  const m = /^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/?$/.exec(repoUrl.trim());
  if (!m) return null;
  return { owner: m[1], repo: m[2].replace(/\.git$/, "") };
}

// On-demand server fetch only. Failures must never block publish.
// Respects rate limits: on 403/429 returns null immediately (no retry loop in V1).
export async function fetchRepoMeta(repoUrl: string): Promise<RepoMeta | null> {
  const parsed = parseRepo(repoUrl);
  if (!parsed) return null;
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "SkillRegistry",
    };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
      headers,
      next: { revalidate: 3600 },
    });
    if (res.status === 403 || res.status === 429 || res.status === 404) return null;
    if (!res.ok) return null;
    const j = (await res.json()) as Record<string, unknown>;
    return {
      stars: typeof j.stargazers_count === "number" ? j.stargazers_count : 0,
      forks: typeof j.forks_count === "number" ? j.forks_count : 0,
      issues: typeof j.open_issues_count === "number" ? j.open_issues_count : 0,
      description: typeof j.description === "string" ? j.description : null,
      defaultBranch: typeof j.default_branch === "string" ? j.default_branch : null,
      lastUpdated: typeof j.updated_at === "string" ? j.updated_at : null,
      license:
        j.license && typeof j.license === "object" && typeof (j.license as Record<string, unknown>).spdx_id === "string"
          ? ((j.license as Record<string, unknown>).spdx_id as string)
          : null,
      owner: parsed.owner,
    };
  } catch {
    return null;
  }
}
