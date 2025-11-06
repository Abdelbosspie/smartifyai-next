import { NextResponse } from "next/server";

export async function GET() {
  // Empty object so the client safely falls back to /api/auth/session
  return NextResponse.json({}, { status: 200 });
}