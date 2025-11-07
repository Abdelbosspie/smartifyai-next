import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { parsePptx } from "pptx-parser"; // very lightweight text grabber

async function requireUser() {
  const session = await getServerSession();
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email }});
  return user;
}

export const runtime = "nodejs"; // need Node APIs for file parsing

export async function POST(req, { params }) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const agent = await prisma.agent.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const arrayBuf = await file.arrayBuffer();
    const buf = Buffer.from(arrayBuf);
    const mime = file.type || "";
    const name = file.name || "upload";
    let extracted = "";

    if (mime === "application/pdf" || name.toLowerCase().endsWith(".pdf")) {
      const res = await pdfParse(buf);
      extracted = res.text || "";
    } else if (
      mime.includes("wordprocessingml.document") ||
      name.toLowerCase().endsWith(".docx")
    ) {
      const res = await mammoth.extractRawText({ buffer: buf });
      extracted = res.value || "";
    } else if (
      mime.includes("presentationml.presentation") ||
      name.toLowerCase().endsWith(".pptx")
    ) {
      const slides = await parsePptx(buf);
      extracted = slides.map(s => (s.text || "")).join("\n---\n");
    } else {
      return NextResponse.json(
        { error: "Only PDF, DOCX, and PPTX are supported right now." },
        { status: 415 }
      );
    }

    // Keep an entry per upload with extracted text
    const saved = await prisma.knowledge.create({
      data: {
        agentId: agent.id,
        kind: "file",
        title: name,
        content: (extracted || "").slice(0, 200_000), // guard against massive files
        fileName: name,
        mimeType: mime,
        size: buf.length,
      },
    });

    return NextResponse.json({ id: saved.id, title: saved.title });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}