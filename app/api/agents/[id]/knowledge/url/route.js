import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

// POST /api/agents/[id]/knowledge/url
// Body: { url: string, title?: string }
export async function POST(req, { params }) {
  try {
    const agentId = params?.id;
    const body = await req.json();
    const url = (body?.url || "").toString().trim();
    const title = (body?.title || "").toString().trim() || null;

    if (!agentId || !url) {
      return NextResponse.json({ error: "Missing agent id or url" }, { status: 400 });
    }

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { id: true },
    });
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    // Fetch HTML and distill to plain text (no extra deps)
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch URL (${res.status})` }, { status: 400 });
    }
    const html = await res.text();
    const text = html
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const created = await prisma.knowledge.create({
      data: {
        agentId,
        type: "url",
        title,
        url,
        content: text.slice(0, 20000), // cap size
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("[KB:url] POST error:", err);
    return NextResponse.json({ error: "Add URL failed" }, { status: 500 });
  }
}