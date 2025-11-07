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
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, plan: true },
    });

    if (user.plan !== "Pro") {
      return NextResponse.json({ error: "Upgrade required" }, { status: 403 });
    }

    const updated = await prisma.agent.update({
      where: { id },
      data: { published: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error publishing agent:", err);
    return NextResponse.json({ error: "Failed to publish" }, { status: 500 });
  }
}