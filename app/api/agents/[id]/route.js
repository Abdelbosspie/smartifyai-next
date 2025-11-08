import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

// GET /api/agents/[id]/knowledge
export async function GET(_req, { params }) {
  try {
    const agentId = params?.id;
    if (!agentId) return NextResponse.json({ error: "Missing agent id" }, { status: 400 });

    // Ensure the agent id is valid (no user/ownership check here)
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { id: true },
    });
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const items = await prisma.knowledge.findMany({
      where: { agentId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
  } catch (err) {
    console.error("[KB] GET error:", err);
    return NextResponse.json({ error: "Failed to load knowledge" }, { status: 500 });
  }
}

// POST /api/agents/[id]/knowledge
// Body: { title?: string, content: string }
export async function POST(req, { params }) {
  try {
    const agentId = params?.id;
    if (!agentId) return NextResponse.json({ error: "Missing agent id" }, { status: 400 });

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { id: true },
    });
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const body = await req.json();
    const content = (body?.content || "").toString().trim();
    const title = (body?.title || "").toString().trim() || null;

    if (!content) return NextResponse.json({ error: "Content is required" }, { status: 400 });

    const created = await prisma.knowledge.create({
      data: { agentId, type: "text", title, content },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("[KB] POST error:", err);
    return NextResponse.json({ error: "Add entry failed" }, { status: 500 });
  }
}

// DELETE /api/agents/[id]/knowledge?id=KNOWLEDGE_ID
export async function DELETE(req, { params }) {
  try {
    const agentId = params?.id;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!agentId || !id) {
      return NextResponse.json({ error: "Missing agent id or knowledge id" }, { status: 400 });
    }

    const existing = await prisma.knowledge.findUnique({
      where: { id },
      select: { id: true, agentId: true },
    });
    if (!existing || existing.agentId !== agentId) {
      return NextResponse.json({ error: "Knowledge item not found" }, { status: 404 });
    }

    await prisma.knowledge.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[KB] DELETE error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}