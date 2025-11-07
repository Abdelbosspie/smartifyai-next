// app/api/agents/[id]/knowledge/upload/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prismadb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function requireOwner(params) {
  let session = await getServerSession(authOptions).catch(() => null);
  if (!session?.user?.id) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const agent = await prisma.agent.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { id: true },
  });
  if (!agent) return { error: NextResponse.json({ error: "Agent not found" }, { status: 404 }) };
  return { agent };
}

export async function POST(req, { params }) {
  const gate = await requireOwner(params);
  if (gate.error) return gate.error;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }

  const name = file.name || "file";
  const ext = (name.split(".").pop() || "").toLowerCase();
  const buf = Buffer.from(await file.arrayBuffer());

  let text = "";
  if (ext === "txt") {
    text = buf.toString("utf8");
  } else if (ext === "pdf") {
    try {
      const mod = await import("pdf-parse"); // CJS compat
      const pdfParse = mod.default || mod;
      const res = await pdfParse(buf);
      text = res?.text || "";
    } catch (e) {
      console.error("pdf-parse error:", e);
      return NextResponse.json({ error: "Failed to parse PDF" }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "Only PDF and TXT supported right now" }, { status: 400 });
  }

  const MAX = 12000;
  if (text.length > MAX) text = text.slice(0, MAX);

  const saved = await prisma.knowledge.create({
    data: { agentId: gate.agent.id, title: name, type: "file", content: text },
  });
  return NextResponse.json(saved);
}