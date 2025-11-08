export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prismadb";
// If your NextAuth file exports authOptions, keep this import.
// If not, change it to wherever your authOptions lives or use getServerSession() as you already do.
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function requireOwner(params, req) {
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

export async function GET(_req, { params }) {
  try {
    const agentId = params?.id;
    // If no id provided, return an empty list instead of error
    if (!agentId) return NextResponse.json([], { status: 200 });

    // Return whatever knowledge we have for this agent id. No auth / 404 gate here.
    const items = await prisma.knowledge.findMany({
      where: { agentId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items, { status: 200 });
  } catch (err) {
    console.error("[KB] GET error:", err);
    return NextResponse.json({ error: "Failed to load knowledge" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const gate = await requireOwner(params, req);
  if (gate.error) return gate.error;

  const body = await req.json().catch(() => null);
  const content = body?.content?.trim();
  const title = body?.title?.trim() || null;
  if (!content) {
    return NextResponse.json({ error: "content required" }, { status: 400 });
  }

  const saved = await prisma.knowledge.create({
    data: { agentId: gate.agent.id, title, content, type: "text" },
  });
  return NextResponse.json(saved);
}

export async function DELETE(req, { params }) {
  const gate = await requireOwner(params, req);
  if (gate.error) return gate.error;

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("id");
  if (!itemId) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const item = await prisma.knowledge.findFirst({
    where: { id: itemId, agentId: gate.agent.id },
    select: { id: true },
  });
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.knowledge.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}