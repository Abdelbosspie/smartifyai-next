// app/api/chat/route.js
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    // 0) Validate env
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Server missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    // 1) Auth (same-origin fetch will include cookies)
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Parse body
    const { agentId, message } = await req.json().catch(() => ({}));
    if (!agentId || !message) {
      return NextResponse.json(
        { error: "Missing agentId or message" },
        { status: 400 }
      );
    }

    // 3) Ensure the agent belongs to this user
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, user: { email: session.user.email } },
      select: { id: true, name: true },
    });
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // 4) Persist user's message
    await prisma.message.create({
      data: { agentId, role: "user", content: message },
    });

    // 5) Call OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const res = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: `You are the "${agent.name}" chatbot.` },
        { role: "user", content: message },
      ],
    });

    const reply =
      res.output_text?.trim() ||
      res.content?.[0]?.text?.trim() ||
      "…";

    // 6) Persist assistant reply
    await prisma.message.create({
      data: { agentId, role: "assistant", content: reply },
    });

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("POST /api/chat error:", err);
    return NextResponse.json(
      { error: "Server error", detail: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}