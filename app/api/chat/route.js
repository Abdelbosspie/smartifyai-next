import prisma from "@/lib/prisma";
import { openai } from "@/lib/openai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { agentId, content } = await req.json();
    if (!agentId || !content) {
      return new Response("agentId and content are required", { status: 400 });
    }

    // Save user message
    const userMsg = await prisma.message.create({
      data: { agentId, role: "user", content },
    });

    // Pull a small recent history for context
    const history = await prisma.message.findMany({
      where: { agentId },
      orderBy: { createdAt: "asc" },
      take: 30,
    });

    const messages = history.map(m => ({
      role: m.role === "assistant" ? "assistant" : m.role === "system" ? "system" : "user",
      content: m.content,
    }));

    // Call OpenAI using the SDK
    const data = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
    });

    const reply = data?.choices?.[0]?.message?.content ?? "…";

    // Save assistant message
    const assistantMsg = await prisma.message.create({
      data: { agentId, role: "assistant", content: reply },
    });

    return Response.json({ reply, id: assistantMsg.id });
  } catch (e) {
    console.error(e);
    return new Response("Server error", { status: 500 });
  }
}