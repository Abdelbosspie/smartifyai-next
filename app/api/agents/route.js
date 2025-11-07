import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prismadb";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agents = await prisma.agent.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, type: true, voice: true, updatedAt: true },
  });

  return NextResponse.json(agents);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, type = "Chatbot", voice } = await req.json();

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const allowed = ["Chatbot", "Voice"];
  if (!allowed.includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const created = await prisma.agent.create({
    data: {
      name: name.trim(),
      type,
      voice: type === "Voice" ? (voice || null) : null,
      user: { connect: { id: session.user.id } },
    },
    select: { id: true, name: true, type: true, voice: true, updatedAt: true },
  });

  return NextResponse.json(created);
}