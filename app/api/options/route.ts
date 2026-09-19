import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [technologies, categories, agents, tags] = await Promise.all([
      prisma.technology.findMany({
        select: { name: true },
        orderBy: { name: "asc" },
      }),
      prisma.category.findMany({
        select: { name: true },
        orderBy: { name: "asc" },
      }),
      prisma.agent.findMany({
        select: { name: true },
        orderBy: { name: "asc" },
      }),
      prisma.tag.findMany({
        select: { name: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({
      technologies: technologies.map((t) => ({ value: t.name, label: t.name })),
      categories: categories.map((c) => ({ value: c.name, label: c.name })),
      agents: agents.map((a) => ({ value: a.name, label: a.name })),
      tags: tags.map((t) => ({ value: t.name, label: t.name })),
    });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Failed to fetch options." } },
      { status: 500 }
    );
  }
}