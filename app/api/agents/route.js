// app/api/agents/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";            // <-- export your authOptions from a shared file
import { prisma } from "@/lib/prismadb";             // <-- your singleton Prisma client

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const agents = await prisma.agent.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(agents);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const body = await req.json();
  const {
    name,
    type = "Chatbot",
    voice,
    prompt,
    model,
    language,
    welcome,
    aiSpeaksFirst,
    dynamicMsgs,
  } = body;

  const created = await prisma.agent.create({
    data: {
      name,
      type,
      // only keep voice if it's a voice agent
      voice: type === "Voice" ? (voice ?? null) : null,
      prompt: prompt ?? null,
      model: model ?? "gpt-3.5-turbo",         // matches your Prisma default
      language: language ?? "English",
      welcome: welcome ?? undefined,           // let DB default apply
      aiSpeaksFirst: Boolean(aiSpeaksFirst),
      dynamicMsgs: Boolean(dynamicMsgs),
      userId: user.id,                         // <-- THIS is the important part
    },
  });

  return NextResponse.json(created, { status: 201 });
}