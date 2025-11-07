// app/api/agents/[id]/knowledge/url/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prismadb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function requireOwner(params) {
  let session = await getServerSession(authOptions).catch(() => null);
  if (!session?.user?.id) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const agent = await prisma.agent.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { id: true },
  });
  if (!agent) return { error: NextResponse.json({ error: "Agent not found" }, { status: 404 }) };
  return { agent };
}

export async function POST(req, { params }) {
  const gate = await requireOwner(params);
  if (gate.error) return gate.error;

  const body = await req.json().catch(() => null);
  let url = (body?.url || "").trim();
  const title = body?.title?.trim() || null;
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

  let snippet = "";
  try {
    const resp = await fetch(url, { method: "GET" });
    const html = await resp.text();
    snippet = html.slice(0, 12000);
  } catch (_) {}

  const saved = await prisma.knowledge.create({
    data: { agentId: gate.agent.id, title: title || url, url, content: snippet, type: "url" },
  });
  return NextResponse.json(saved);
}