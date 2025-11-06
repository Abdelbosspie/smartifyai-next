import { NextResponse } from "next/server";

import prisma from "../../../../lib/prismadb";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, name, workspaceName } = body || {};

    if (!email) {
      return NextResponse.json({ ok: false, error: "Missing email" }, { status: 400 });
    }

    let user;

    // Try updating an existing user, or create if not found
    try {
      user = await prisma.user.update({
        where: { email },
        data: { name, workspaceName },
      });
    } catch {
      user = await prisma.user.create({
        data: { email, name: name || "", workspaceName: workspaceName || "" },
      });
    }

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error("Error saving profile:", err);
    return NextResponse.json({ ok: false, error: "Failed to save profile." }, { status: 500 });
  }
}