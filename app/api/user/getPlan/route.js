import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prismadb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ plan: "Free" });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { plan: true },
    });

    return NextResponse.json({ plan: user?.plan || "Free" });
  } catch (error) {
    console.error("❌ /api/user/getPlan error:", error);
    return NextResponse.json({ plan: "Free" });
  }
}