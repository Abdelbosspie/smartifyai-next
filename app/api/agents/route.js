import { prisma } from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, type, voice, phone } = body;

    // Basic validation
    if (!name || !type) {
      return new Response("Missing required fields", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const agent = await prisma.agent.create({
      data: {
        name,
        type,
        voice: type === "voice" ? voice : null, // only save if type = voice
        phone: type === "voice" ? phone : null,
        userId: user.id,
      },
    });

    return new Response(JSON.stringify(agent), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response("Failed to create agent", { status: 500 });
  }
}