import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prismadb";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Ensure the agent belongs to the current user
    const agent = await prisma.agent.findFirst({
      where: { id, userId: user.id },
    });
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Update fields
    const updated = await prisma.agent.update({
      where: { id },
      data: {
        name: body.name || agent.name,
        model: body.model || agent.model,
        prompt: body.prompt || agent.prompt,
        language: body.language || agent.language,
        welcome: body.welcome || agent.welcome,
        aiSpeaksFirst: body.aiSpeaksFirst ?? agent.aiSpeaksFirst,
        dynamicMsgs: body.dynamicMsgs ?? agent.dynamicMsgs,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating agent:", err);
    return NextResponse.json(
      { error: "Failed to update agent" },
      { status: 500 }
    );
  }
}