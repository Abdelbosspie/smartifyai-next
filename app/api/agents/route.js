// app/api/agents/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { auth } from "@/lib/auth"; // your NextAuth helper

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  // If the user doesn't exist yet, just return empty list
  if (!user) return NextResponse.json([]);

  const agents = await prisma.agent.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(agents);
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    name,
    type = "Chatbot",
    voice = null,
    model,
    language,
    prompt,
    welcome,
    aiSpeaksFirst,
    dynamicMsgs,
  } = body || {};

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // ✅ Ensure a User row exists for this session email
  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    update: {},
    create: {
      email: session.user.email,
      name: session.user.name ?? session.user.email.split("@")[0],
    },
  });

  // Create the agent (safe defaults match your Prisma schema)
  const agent = await prisma.agent.create({
    data: {
      name: name.trim(),
      type,
      voice: type === "Voice" ? voice : null,
      model: model || "gpt-3.5-turbo",
      language: language || "English",
      prompt: prompt ?? null,
      welcome: welcome ?? "Hi there! How can I help you?",
      aiSpeaksFirst: aiSpeaksFirst ?? false,
      dynamicMsgs: dynamicMsgs ?? false,
      user: { connect: { id: user.id } },
    },
  });

  return NextResponse.json(agent);
}