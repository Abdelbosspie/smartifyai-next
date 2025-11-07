import { PrismaClient } from "@prisma/client";

// cache the client in dev to avoid re-instantiating on hot reloads
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma._prisma ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma._prisma = prisma;
}

export { prisma };            // named export
export default prisma;        // optional default export