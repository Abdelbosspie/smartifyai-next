import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prismadb";

async function getUserId(session) {
  if (session?.user?.id) return session.user.id;
  if (session?.user?.email) {
    const u = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    return u?.id ?? null;
  }
  return null;
}

export async function GET(_req, { params }) {
  const session = await getServerSession(authOptions);
  const userId = await getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const agent = await prisma.agent.findFirst({
    where: { id, userId },
    select: { id: true, name: true, type: true, voice: true, prompt: true, updatedAt: true },
  });

  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(agent);
}

// Allows saving name/type/voice/prompt from the builder
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  const userId = await getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const existing = await prisma.agent.findFirst({ where: { id, userId }, select: { id: true, type: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { name, type, voice, prompt } = body || {};
  const data = {};

  if (typeof name === "string") data.name = name.trim();
  if (type === "Chatbot" || type === "Voice") data.type = type;
  if (typeof prompt === "string") data.prompt = prompt;

  // voice only sticks if type is Voice
  if ((data.type ?? existing.type) === "Voice") {
    if (typeof voice === "string") data.voice = voice;
  } else {
    data.voice = null;
  }

  const updated = await prisma.agent.update({
    where: { id },
    data,
    select: { id: true, name: true, type: true, voice: true, prompt: true, updatedAt: true },
  });

  return NextResponse.json(updated);
}