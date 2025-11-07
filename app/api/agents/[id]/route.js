import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prismadb";

async function getUserId(session) {
  if (session?.user?.id) return session.user.id;
  if (session?.user?.email) {
    const u = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    return u?.id ?? null;
  }
  return null;
}

export async function GET(_req, { params }) {
  const session = await getServerSession(authOptions);
  const userId = await getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agent = await prisma.agent.findFirst({
    where: { id: params.id, userId },
    select: { id: true, name: true, type: true, voice: true, instructions: true, updatedAt: true },
  });
  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(agent);
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  const userId = await getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const exists = await prisma.agent.findFirst({ where: { id: params.id, userId }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const contentType = req.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await req.json()
    : Object.fromEntries((await req.formData()).entries());

  const instructions = typeof body.instructions === "string" ? body.instructions : undefined;

  const updated = await prisma.agent.update({
    where: { id: params.id },
    data: { ...(instructions !== undefined ? { instructions } : {}) },
    select: { id: true, name: true, type: true, voice: true, instructions: true, updatedAt: true },
  });

  return NextResponse.json({ success: true, agent: updated });
}

export async function DELETE(_req, { params }) {
  const session = await getServerSession(authOptions);
  const userId = await getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const exists = await prisma.agent.findFirst({ where: { id: params.id, userId }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.agent.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}