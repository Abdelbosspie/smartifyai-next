import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_req, { params }) {
  const { id } = params;
  try {
    const messages = await prisma.message.findMany({
      where: { agentId: id },
      orderBy: { createdAt: "asc" },
      take: 100,
    });
    return Response.json({ messages });
  } catch (e) {
    console.error(e);
    return new Response("Failed to load messages", { status: 500 });
  }
}