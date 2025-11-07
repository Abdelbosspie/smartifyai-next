import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prismadb";

export async function GET(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agent = await prisma.agent.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { id: true, name: true, type: true, voice: true, instructions: true, updatedAt: true },
  });

  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(agent);
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const exists = await prisma.agent.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { id: true },
  });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { instructions } = body;

  const updated = await prisma.agent.update({
    where: { id: params.id },
    data: {
      ...(typeof instructions === "string" ? { instructions } : {}),
    },
    select: { id: true, name: true, type: true, voice: true, instructions: true, updatedAt: true },
  });

  return NextResponse.json({ success: true, agent: updated });
}

export async function DELETE(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const exists = await prisma.agent.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { id: true },
  });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.agent.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}