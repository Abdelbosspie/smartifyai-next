import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all agents
export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(agents);
  } catch (error) {
    console.error("GET /agents error:", error);
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, type, voice } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // 👇 Hardcode your test user ID here from your database
    const testUserId = "cmho19hik0000l704h0v21y5v";

    const newAgent = await prisma.agent.create({
      data: {
        name,
        type: type || "Chatbot",
        voice: type === "Voice" ? voice || null : null,
        user: { connect: { id: testUserId } }, // ✅ This line links the Agent to a user
      },
    });

    return NextResponse.json(newAgent);
  } catch (error) {
    console.error("POST /agents error:", error);
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 });
  }
}