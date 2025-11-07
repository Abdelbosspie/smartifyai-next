// app/api/agents/[id]/knowledge/url/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prismadb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function requireOwner(params) {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    session = await getServerSession();
  }
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const agent = await prisma.agent.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { id: true },
  });
  if (!agent) {
    return { error: NextResponse.json({ error: "Agent not found" }, { status: 404 }) };
  }
  return { session, agent };
}

export async function POST(req, { params }) {
  const gate = await requireOwner(params);
  if (gate.error) return gate.error;

  const body = await req.json().catch(() => null);
  let url = (body?.url || "").trim();
  const title = body?.title?.trim() || null;
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  // Normalize URL (add protocol if missing)
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

  try {
    const resp = await fetch(url, { method: "GET" });
    const text = await resp.text();
    const snippet = text.slice(0, 12000); // store a capped snippet
    const saved = await prisma.knowledge.create({
      data: {
        agentId: gate.agent.id,
        title: title || url,
        url,
        content: snippet,
        type: "url",
      },
    });
    return NextResponse.json(saved);
  } catch {
    // Save the link even if fetch fails
    const saved = await prisma.knowledge.create({
      data: {
        agentId: gate.agent.id,
        title: title || url,
        url,
        content: "",
        type: "url",
      },
    });
    return NextResponse.json(saved, { status: 201 });
  }
}