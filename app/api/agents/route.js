import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prismadb";

async function getUserId(session) {
  if (session?.user?.id) return session.user.id;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    return user?.id ?? null;
  }
  return null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = await getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agents = await prisma.agent.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, type: true, voice: true, updatedAt: true },
  });
  return NextResponse.json(agents);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  const userId = await getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, type = "Chatbot", voice = null } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const created = await prisma.agent.create({
    data: {
      name: name.trim(),
      type,
      voice: type === "Voice" ? (voice ?? null) : null,
      userId,
    },
    select: { id: true, name: true, type: true, voice: true, updatedAt: true },
  });

  return NextResponse.json(created, { status: 201 });
}