import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import db from "../../../lib/prismadb";

// GET /api/agents  -> list current user's agents
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ agents: [] });

  const agents = await db.agent.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ agents });
}

// POST /api/agents  -> create new agent
export async function POST(req) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const name = (body?.name || "New Agent").toString().slice(0, 60);
  const type = (body?.type || "Chatbot").toString().slice(0, 30);
  const voice = (body?.voice || "Default").toString().slice(0, 30);

  const agent = await db.agent.create({
    data: { name, type, voice, userId },
  });

  return NextResponse.json({ agent }, { status: 201 });
}