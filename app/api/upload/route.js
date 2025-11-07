import { NextResponse } from "next/server";

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  // TODO: add actual PDF parsing & embedding logic later
  return NextResponse.json({ filename: file.name, size: file.size });
}