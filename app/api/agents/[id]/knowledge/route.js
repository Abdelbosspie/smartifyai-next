import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";

/** Helper: safely extract the agent id from route params or URL path */
function extractAgentId(req, ctx) {
  try {
    if (ctx?.params?.id) return String(ctx.params.id);
    const url = new URL(req.url);
    const parts = url.pathname.split("/"); // /api/agents/:id/knowledge
    const idx = parts.findIndex((p) => p === "agents");
    if (idx !== -1 && parts[idx + 1]) return String(parts[idx + 1]);
  } catch {
    // no-op
  }
  return null;
}

/** --- GET: list knowledge items for an agent (never 404; returns [] on any issue) --- */
export async function GET(req, ctx) {
  try {
    const agentId = extractAgentId(req, ctx);
    if (!agentId) {
      // No id? return empty list rather than error so UI never breaks
      return NextResponse.json([], { status: 200 });
    }

    const items = await prisma.knowledge.findMany({
      where: { agentId: String(agentId) },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items ?? [], { status: 200 });
  } catch (err) {
    console.error("[KB] GET error:", err);
    // Important: never throw—return empty array so the builder stays usable
    return NextResponse.json([], { status: 200 });
  }
}

/** --- DELETE: remove a knowledge item by id (idempotent & flexible) --- */
export async function DELETE(req, ctx) {
  try {
    const agentId = extractAgentId(req, ctx);

    // Accept id from query string, JSON body, or header for resilience
    const { searchParams } = new URL(req.url);
    let itemId = searchParams.get("id");

    if (!itemId) {
      const body = await req.json().catch(() => null);
      itemId =
        body?.id ||
        body?.itemId ||
        body?.knowledgeId ||
        req.headers.get("x-knowledge-id") ||
        null;
    }

    if (!itemId) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    // Scope delete by item id; if agentId is known, include it for extra safety.
    const whereClause = {
      id: String(itemId),
      ...(agentId ? { agentId: String(agentId) } : {}),
    };

    const result = await prisma.knowledge.deleteMany({
      where: whereClause,
    });

    return NextResponse.json({ ok: true, deleted: result.count }, { status: 200 });
  } catch (err) {
    console.error("[KB] DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}