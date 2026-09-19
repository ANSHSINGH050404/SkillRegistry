import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchRepoMeta } from "@/lib/github";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { action } = (await req.json().catch(() => ({}))) as { action?: string };
    if (action === "approve") {
      const skill = await prisma.skill.findUnique({ where: { id }, select: { id: true, repositoryUrl: true } });
      if (!skill) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Skill not found." } }, { status: 404 });
      let github: { githubStars?: number; githubForks?: number; githubIssues?: number; githubLastUpdated?: string | null } = {};
      if (skill.repositoryUrl) {
        const meta = await fetchRepoMeta(skill.repositoryUrl);
        if (meta) {
          github = {
            githubStars: meta.stars, githubForks: meta.forks, githubIssues: meta.issues,
            githubLastUpdated: meta.lastUpdated,
          };
        }
      }
      await prisma.skill.update({
        where: { id },
        data: { status: "PUBLISHED", ...github },
      });
      return NextResponse.json({ ok: true, status: "PUBLISHED" });
    }
    if (action === "reject") {
      await prisma.skill.update({ where: { id }, data: { status: "REJECTED" } });
      return NextResponse.json({ ok: true, status: "REJECTED" });
    }
    if (action === "archive") {
      await prisma.skill.update({ where: { id }, data: { status: "ARCHIVED" } });
      return NextResponse.json({ ok: true, status: "ARCHIVED" });
    }
    if (action === "feature") {
      const s = await prisma.skill.findUnique({ where: { id }, select: { featured: true } });
      await prisma.skill.update({ where: { id }, data: { featured: !s?.featured } });
      return NextResponse.json({ ok: true });
    }
    if (action === "verify") {
      const { verification } = (await req.json().catch(() => ({}))) as { verification?: string };
      const allowed = ["COMMUNITY", "VERIFIED", "OFFICIAL"];
      const v = typeof verification === "string" ? verification : "VERIFIED";
      if (!allowed.includes(v)) return NextResponse.json({ error: { code: "INVALID", message: "Bad verification." } }, { status: 400 });
      await prisma.skill.update({ where: { id }, data: { verification: v as never } });
      return NextResponse.json({ ok: true });
    }
    if (action === "revalidate") {
      const skill = await prisma.skill.findUnique({ where: { id }, select: { repositoryUrl: true } });
      if (!skill?.repositoryUrl) return NextResponse.json({ error: { code: "INVALID", message: "No repository." } }, { status: 400 });
      const meta = await fetchRepoMeta(skill.repositoryUrl);
      if (!meta) return NextResponse.json({ error: { code: "GITHUB", message: "GitHub fetch failed." } }, { status: 502 });
      await prisma.skill.update({
        where: { id },
        data: { githubStars: meta.stars, githubForks: meta.forks, githubIssues: meta.issues, githubLastUpdated: meta.lastUpdated },
      });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: { code: "INVALID", message: "Unknown action." } }, { status: 400 });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL", message: "Something went wrong." } }, { status: 500 });
  }
}
