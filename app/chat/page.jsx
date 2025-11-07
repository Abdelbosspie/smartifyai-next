import OpenAI from "openai";
import { NextResponse } from "next/server";

// Optional: make this route always run dynamically (no static caching)
// export const dynamic = "force-dynamic";

export async function POST(req) {
  // Parse body once so we can reuse it in error paths
  let body = {};
  try {
    body = await req.json();
  } catch {
    // ignore, handled below
  }
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const agentId = body?.agentId || null;

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  // Demo fallback: return a synthetic reply without calling OpenAI
  const DEMO = process.env.CHAT_DEMO_MODE === "1";
  if (DEMO) {
    const reply = `Demo mode: you said “${message}”.`;
    return NextResponse.json({ reply, demo: true });
  }

  // Real LLM path
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing OPENAI_API_KEY." },
      { status: 500 }
    );
  }

  const openai = new OpenAI({ apiKey });

  try {
    // Use a small, inexpensive model by default; override via env if desired
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    // If you're on the newer SDK, chat.completions is still supported.
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "You are a helpful assistant for SmartifyAI." },
        // You could thread per agent here in the future using agentId
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    const reply =
      completion?.choices?.[0]?.message?.content?.trim?.() ||
      completion?.choices?.[0]?.message?.content ||
      "…";

    return NextResponse.json({ reply });
  } catch (err) {
    // Normalise common OpenAI error shapes
    const status =
      err?.status ||
      err?.response?.status ||
      (err?.code === "insufficient_quota" ? 429 : 500);

    // If quota is exceeded and demo fallback is enabled, still give a response
    if (status === 429 && process.env.CHAT_DEMO_MODE === "1") {
      return NextResponse.json(
        {
          reply: `Demo reply (quota exceeded). Echo: “${message}”`,
          error: "insufficient_quota",
          demo: true,
        },
        { status: 200 }
      );
    }

    const messageOut =
      status === 429
        ? "OpenAI quota exceeded. Add billing or enable demo fallback."
        : err?.message || "Chat failed.";
    return NextResponse.json({ error: messageOut }, { status });
  }
}

export async function GET() {
  // Simple health check so you can test in the browser
  return NextResponse.json({ ok: true });
}