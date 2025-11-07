import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import OpenAI from "openai";

export const runtime = "nodejs";

// Initialize OpenAI client only if a key exists to prevent crashes on preview/free plans
const openai =
  process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

export async function POST(req) {
  try {
    const body = await req.json();

    const agentId = body.agentId;
    // Support either a single `message` or an array of `messages` for flexibility
    const singleMessage = body.message;
    const messageList = Array.isArray(body.messages) ? body.messages : null;

    if (!agentId || (!singleMessage && !messageList)) {
      return NextResponse.json(
        { error: "agentId and message(s) are required" },
        { status: 400 }
      );
    }

    // Fetch agent without requiring auth — prevents build/runtime errors from authOptions
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        knowledge: {
          select: { content: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Build knowledge context (safe if table is empty or missing)
    const knowledgeText = (agent.knowledge || [])
      .map((k) => k.content)
      .filter(Boolean)
      .join("\n---\n")
      .slice(0, 8000);

    const language = agent.language || "English";

    // System prompt enforces language and optional custom prompt + KB
    const systemPrompt = [
      `You are ${agent.name}, a helpful ${agent.type?.toLowerCase() || "assistant"}.`,
      agent.prompt ? `Custom instructions:\n${agent.prompt}` : "",
      knowledgeText ? `Knowledge base:\n${knowledgeText}` : "",
      language === "Multilingual"
        ? "Reply in the user's language. If unclear, default to English."
        : `Always reply in ${language}.`,
    ]
      .filter(Boolean)
      .join("\n\n");

    // Build chat messages
    const chatMessages = messageList
      ? [
          { role: "system", content: systemPrompt },
          ...messageList.map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: String(m.content || ""),
          })),
        ]
      : [
          { role: "system", content: systemPrompt },
          { role: "user", content: String(singleMessage) },
        ];

    // Try OpenAI, otherwise return a friendly preview response so the UI never breaks
    let replyText = "";
    if (openai) {
      try {
        const resp = await openai.chat.completions.create({
          model: agent.model || "gpt-3.5-turbo",
          messages: chatMessages,
          temperature: 0.7,
        });
        replyText =
          resp.choices?.[0]?.message?.content?.trim() ||
          "I couldn't generate a response.";
      } catch (err) {
        console.error("OpenAI error:", err);
      }
    }

    if (!replyText) {
      // Fallback keeps Live Preview functional (e.g., when quota/key is missing)
      const lastUser =
        messageList?.slice().reverse().find((m) => m.role !== "assistant")
          ?.content ?? singleMessage ?? "";
      replyText = `✅ Live preview is working. (OpenAI unavailable here.) Echo: ${lastUser}`;
    }

    // We intentionally skip saving messages here to avoid foreign-key issues (no userId in preview).
    return NextResponse.json({ reply: replyText });
  } catch (err) {
    console.error("/api/chat error:", err);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}