import { prisma } from "./prismadb";
export async function getUserPlan(userId) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  return sub?.plan || "FREE";
}
