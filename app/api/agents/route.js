// app/api/agents/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { auth } from "@/lib/auth";

export const revalidate = 0; // no caching

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      // first time ever — just return empty list instead of 500
      return NextResponse.json([]);
    }

    const agents = await prisma.agent.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(agents);
  } catch (err) {
    console.error("GET /api/agents failed:", err);
    return NextResponse.json(
      { error: "Internal", details: err?.message ?? "unknown" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
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

    // Ensure a user row exists
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name ?? session.user.email.split("@")[0],
      },
      select: { id: true },
    });

    const agent = await prisma.agent.create({
      data: {
        userId: user.id,
        name: name.trim(),
        type,
        voice: type === "Voice" ? voice : null,
        model: model || "gpt-3.5-turbo",         // matches your schema defaults
        language: language || "English",
        prompt: prompt ?? null,
        welcome: welcome ?? "Hi there! How can I help you?",
        aiSpeaksFirst: aiSpeaksFirst ?? false,
        dynamicMsgs: dynamicMsgs ?? false,
      },
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (err) {
    console.error("POST /api/agents failed:", err);
    // Surface Prisma errors clearly (FK, missing column, etc.)
    return NextResponse.json(
      { error: "Internal", details: err?.message ?? "unknown" },
      { status: 500 }
    );
  }
}