import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prismadb";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const { title, content } = await req.json();

    if (!content)
      return NextResponse.json({ error: "Content required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    const agent = await prisma.agent.findFirst({
      where: { id, userId: user.id },
    });
    if (!agent)
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const entry = await prisma.knowledge.create({
      data: {
        agentId: id,
        title: title || "Untitled",
        content,
      },
    });

    return NextResponse.json(entry);
  } catch (err) {
    console.error("Error adding knowledge:", err);
    return NextResponse.json({ error: "Failed to save knowledge" }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const entries = await prisma.knowledge.findMany({
      where: { agentId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(entries);
  } catch (err) {
    console.error("GET /knowledge error:", err);
    return NextResponse.json({ error: "Failed to load knowledge" }, { status: 500 });
  }
}