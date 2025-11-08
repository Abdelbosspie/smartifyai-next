export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prismadb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/** Safely obtain the NextAuth session in any environment */
async function getSession() {
  try {
    return await getServerSession(authOptions);
  } catch {
    try {
      return await getServerSession();
    } catch {
      return null;
    }
  }
}

/** --- GET: list knowledge items (never 404) --- */
export async function GET(_req, { params }) {
  try {
    const agentId = params?.id ?? null;
    if (!agentId) return NextResponse.json([], { status: 200 });

    const items = await prisma.knowledge.findMany({
      where: { agentId: String(agentId) },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items, { status: 200 });
  } catch (err) {
    console.error("[KB] GET error:", err);
    // Never break the UI—return an empty list on error
    return NextResponse.json([], { status: 200 });
  }
}

/** --- POST: add a manual text/url/file entry --- */
export async function POST(req, { params }) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agentId = String(params?.id || "");
    if (!agentId) {
      return NextResponse.json({ error: "agentId required" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const content = body?.content?.trim();
    const title = body?.title?.trim() || null;
    const type = body?.type || "text";
    if (!content) {
      return NextResponse.json({ error: "content required" }, { status: 400 });
    }

    // Ensure this agent belongs to the current user
    const owned = await prisma.agent.findFirst({
      where: { id: agentId, userId: session.user.id },
      select: { id: true },
    });
    if (!owned) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const saved = await prisma.knowledge.create({
      data: { agentId, title, content, type },
    });
    return NextResponse.json(saved, { status: 200 });
  } catch (err) {
    console.error("[KB] POST error:", err);
    return NextResponse.json({ error: "Failed to add entry" }, { status: 500 });
  }
}

/** --- DELETE: remove a knowledge item by id (idempotent) --- */
export async function DELETE(req, _ctx) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("id");
    if (!itemId) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    // Delete only if the item belongs to an agent owned by the user.
    // Using deleteMany makes the operation idempotent.
    const result = await prisma.knowledge.deleteMany({
      where: { id: itemId, agent: { userId: session.user.id } },
    });

    return NextResponse.json({ ok: true, deleted: result.count }, { status: 200 });
  } catch (err) {
    console.error("[KB] DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}