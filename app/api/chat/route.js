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
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { agentId, message } = await req.json();
    if (!agentId || !message)
      return NextResponse.json(
        { error: "agentId and message are required" },
        { status: 400 }
      );

    // Fetch agent with prompt, model, and knowledge
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, userId },
      include: {
        knowledge: { select: { content: true } },
      },
    });
    if (!agent)
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    if (!openai)
      return NextResponse.json({
        reply: `${agent.name}: ${message}`,
      });

    // Construct dynamic system prompt
    const knowledgeText = agent.knowledge?.map((k) => k.content).join("\n") ?? "";
    const systemPrompt = `
You are ${agent.name}, a helpful ${agent.type?.toLowerCase() || "assistant"}.
${agent.prompt ? `\nCustom instructions:\n${agent.prompt}` : ""}
${knowledgeText ? `\nKnowledge base:\n${knowledgeText}` : ""}
When asked about your model, respond: "${agent.model || "gpt-4-turbo"}".
Always reply in ${agent.language || "English"}.
    `;

    const completion = await openai.chat.completions.create({
      model: agent.model || "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() || "…";

    // Save message (optional)
    await prisma.message.create({
      data: {
        agentId,
        userId,
        role: "user",
        content: message,
      },
    });
    await prisma.message.create({
      data: {
        agentId,
        userId,
        role: "assistant",
        content: reply,
      },
    });

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("/api/chat error:", err);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}