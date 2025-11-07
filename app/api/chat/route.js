import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import OpenAI from "openai";

export const runtime = "nodejs";

// Initialize OpenAI client only if a key exists to prevent crashes on preview/free plans
const openai =
  process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

/**
 * Build a compact knowledge context string from recent knowledge entries.
 * We include titles / sources and the first chunk of text from each entry.
 */
function buildKnowledgeContext(entries = [], maxChars = 8000) {
  try {
    const parts = [];
    for (const k of entries) {
      const label = k?.title || k?.fileName || k?.sourceUrl || k?.fileUrl || "Entry";
      const text = (k?.content || k?.extractedText || "").toString();
      const header = `### ${label}`;
      const body = text.trim().length ? text.trim() : (k?.sourceUrl ? `See: ${k.sourceUrl}` : "(no extracted text)");
      parts.push(`${header}\n${body}`);
      // Stop if we are approaching the character budget
      if (parts.join("\n---\n").length > maxChars) break;
    }
    return parts.join("\n---\n").slice(0, maxChars);
  } catch {
    return "";
  }
}

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

    // Fetch agent and most recent knowledge. We avoid auth lookups here so Live Preview works.
    let agent = null;
    let knowledge = [];
    try {
      agent = await prisma.agent.findUnique({
        where: { id: agentId },
        include: {
          knowledge: {
            select: {
              id: true,
              title: true,
              content: true,
              kind: true,
              mimeType: true,
              fileUrl: true,
              fileName: true,
              sourceUrl: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 12,
          },
        },
      });
      knowledge = agent?.knowledge || [];
    } catch (e) {
      // If the Knowledge table doesn't exist yet or any other read error occurs,
      // keep going without KB rather than failing the chat.
      knowledge = [];
    }

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Build knowledge context (safe if table is empty/missing)
    const knowledgeText = buildKnowledgeContext(knowledge, 8000);

    const language = agent.language || "English";

    // System prompt enforces language and optional custom prompt + KB
    const systemPrompt = [
      `You are ${agent.name}, a helpful ${agent.type?.toLowerCase() || "assistant"}.`,
      agent.prompt ? `Custom instructions:\n${agent.prompt}` : "",
      knowledgeText ? `Knowledge base (most recent first):\n${knowledgeText}` : "",
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
        const model = agent.model || "gpt-3.5-turbo"; // default if none chosen yet
        const resp = await openai.chat.completions.create({
          model,
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
      replyText = `✅ Live preview is working. (OpenAI unavailable here.)\n\nEcho: ${lastUser}`;
      if (knowledgeText) {
        replyText += `\n\n(Used ${knowledge.length} knowledge entr${knowledge.length === 1 ? "y" : "ies"} as context.)`;
      }
    }

    // We intentionally skip saving messages here to avoid foreign-key issues (no userId in preview).
    return NextResponse.json({ reply: replyText });
  } catch (err) {
    console.error("/api/chat error:", err);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}