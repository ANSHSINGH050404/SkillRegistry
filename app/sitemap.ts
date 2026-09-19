import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/skills`, lastModified: new Date() },
    { url: `${base}/technologies`, lastModified: new Date() },
    { url: `${base}/categories`, lastModified: new Date() },
    { url: `${base}/agents`, lastModified: new Date() },
  ];
  try {
    const [skills, techs, cats, agents] = await Promise.all([
      prisma.skill.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
      prisma.technology.findMany({ select: { slug: true } }),
      prisma.category.findMany({ select: { slug: true } }),
      prisma.agent.findMany({ select: { slug: true } }),
    ]);
    return [
      ...staticRoutes,
      ...skills.map((s) => ({ url: `${base}/skills/${s.slug}`, lastModified: s.updatedAt })),
      ...techs.map((t) => ({ url: `${base}/technologies/${t.slug}`, lastModified: new Date() })),
      ...cats.map((c) => ({ url: `${base}/categories/${c.slug}`, lastModified: new Date() })),
      ...agents.map((a) => ({ url: `${base}/agents/${a.slug}`, lastModified: new Date() })),
    ];
  } catch {
    return staticRoutes;
  }
}
