import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/chat  { agentId, message }
export async function POST(req) {
  try {
    const { agentId, message } = await req.json();
    if (!message || !agentId) {
      return NextResponse.json({ error: "agentId and message are required" }, { status: 400 });
    }

    // (Optional) You could load the agent by id and use its system prompt/voice here.
    // For now we just send a simple system prompt.
    const system = `You are an assistant for agent ${agentId}. Reply briefly and helpfully.`;

    // Use the Chat Completions API for maximum model compatibility
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    const assistant = completion.choices?.[0]?.message?.content ?? "…";
    return NextResponse.json({ assistant });
  } catch (err) {
    console.error("POST /api/chat error:", err);
    return NextResponse.json({ error: "Failed to get a reply" }, { status: 500 });
  }
}