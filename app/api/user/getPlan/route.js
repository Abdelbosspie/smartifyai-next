export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prismadb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ plan: "Free" }, { headers: { "Cache-Control": "no-store" } });
    }
    const user = await prisma.user.findUnique({ where: { email }, select: { plan: true } });
    return NextResponse.json({ plan: user?.plan || "Free" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ plan: "Free" }, { headers: { "Cache-Control": "no-store" } });
  }
}