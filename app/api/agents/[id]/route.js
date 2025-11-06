import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import db from "../../../../lib/prismadb";

export async function PATCH(_req, { params }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = params?.id;
  const body = await _req.json();
  const updated = await db.agent.update({
    where: { id, userId },
    data: {
      name: body?.name ?? undefined,
      type: body?.type ?? undefined,
      voice: body?.voice ?? undefined,
    },
  });
  return NextResponse.json({ agent: updated });
}

export async function DELETE(_req, { params }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = params?.id;
  await db.agent.delete({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}