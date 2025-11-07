import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// Tiny helper – mirror your other routes’ approach.
async function requireUser() {
  const session = await getServerSession();
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email }});
  return user;
}

// GET /api/agents/:id/knowledge  -> list entries
export async function GET(req, { params }) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const agent = await prisma.agent.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const entries = await prisma.knowledge.findMany({
      where: { agentId: agent.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(entries);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

// POST /api/agents/:id/knowledge  -> add manual text OR a URL
export async function POST(req, { params }) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const agent = await prisma.agent.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const body = await req.json();
    const { kind = "text", title = "", content = "", url = "" } = body || {};

    if (kind === "url") {
      if (!url?.startsWith("http")) {
        return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
      }
      const saved = await prisma.knowledge.create({
        data: {
          agentId: agent.id,
          kind: "url",
          title: title || "Link",
          sourceUrl: url,
        },
      });
      return NextResponse.json(saved);
    }

    // default: text
    if (!content?.trim()) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }
    const saved = await prisma.knowledge.create({
      data: {
        agentId: agent.id,
        kind: "text",
        title: title || "Note",
        content,
      },
    });
    return NextResponse.json(saved);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}