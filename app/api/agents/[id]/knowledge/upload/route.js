// app/api/agents/[id]/knowledge/upload/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export const runtime = "nodejs"; // ensure Node, not Edge

// lazy load pdf-parse to avoid build-time bundling issues
let _pdfParse = null;
async function getPdfParse() {
  if (_pdfParse) return _pdfParse;
  const mod = await import("pdf-parse");
  _pdfParse = mod.default ?? mod; // handle both ESM/CJS
  return _pdfParse;
}

export async function POST(req, { params }) {
  try {
    const { id: agentId } = params || {};
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const name = file.name || "upload";
    const mimeType = file.type || "application/octet-stream";
    const buf = Buffer.from(await file.arrayBuffer());

    let content = "";
    let kind = "file";

    // PDF -> extract text
    const isPdf = mimeType === "application/pdf" || name.toLowerCase().endsWith(".pdf");
    if (isPdf) {
      const pdfParse = await getPdfParse();
      const result = await pdfParse(buf);
      content = (result.text || "").slice(0, 20000); // cap to keep tokens sane
      kind = "pdf";
    }
    // Plain text fallback
    else if (mimeType.startsWith("text/")) {
      content = buf.toString("utf8").slice(0, 20000);
      kind = "text";
    }
    // DOCX/PPTX and others: store metadata now; parser can be added later
    else {
      // You can later add a safe server-side parser without browser globals.
      kind = "file";
      content = ""; // keep empty so chat won’t try to use it yet
    }

    const saved = await prisma.knowledge.create({
      data: {
        agentId,
        kind,
        title: name,
        mimeType,
        size: buf.length,
        content: content || null,
        sourceUrl: null,
      },
    });

    return NextResponse.json(saved);
  } catch (err) {
    console.error("upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}