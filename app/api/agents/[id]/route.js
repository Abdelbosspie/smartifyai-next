
// app/api/agents/[id]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prismadb";

async function getUserId(session) {
  if (session?.user?.id) return session.user.id;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    return user?.id ?? null;
  }
  return null;
}

// GET /api/agents/:id  -> return one agent (scoped to the logged-in user)
export async function GET(_req, { params }) {
  const session = await getServerSession(authOptions);
  const userId = await getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agent = await prisma.agent.findFirst({
    where: { id: params.id, userId },
    select: { id: true, name: true, type: true, voice: true, instructions: true, updatedAt: true },
  });
  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(agent);
}

// PATCH /api/agents/:id  -> update name/type/voice/instructions
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  const userId = await getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const data = {};

  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.type === "string") data.type = body.type;
  if ("instructions" in body) data.instructions = body.instructions ?? null;

  if ("voice" in body || "type" in body) {
    const voiceVal = body.type === "Voice" ? (body.voice ?? null) : null;
    data.voice = voiceVal;
  }

  // ensure ownership
  const existing = await prisma.agent.findFirst({
    where: { id: params.id, userId },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.agent.update({
    where: { id: params.id },
    data,
    select: { id: true, name: true, type: true, voice: true, instructions: true, updatedAt: true },
  });

  return NextResponse.json(updated);
}

// (optional) DELETE /api/agents/:id
export async function DELETE(_req, { params }) {
  const session = await getServerSession(authOptions);
  const userId = await getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deleted = await prisma.agent.deleteMany({
    where: { id: params.id, userId },
  });
  if (!deleted.count) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}