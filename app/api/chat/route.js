import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prismadb";
import OpenAI from "openai";

const openai =
  process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

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

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const userId = await getUserId(session);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { agentId, message } = await req.json();
    if (!agentId || !message)
      return NextResponse.json({ error: "agentId and message are required" }, { status: 400 });

    // Owns the agent?
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, userId },
      select: { name: true, type: true, voice: true }, // no 'prompt'
    });
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    // No key? Just echo to avoid 500s.
    if (!openai) return NextResponse.json({ reply: `${agent.name}: ${message}` });

    const system = `You are ${agent.name}, a helpful ${agent.type?.toLowerCase() || "chatbot"}.`;
    const r = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    const reply = r.choices?.[0]?.message?.content?.trim() || "…";
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("/api/chat error:", err);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}