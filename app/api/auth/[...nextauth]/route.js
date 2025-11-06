import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Create one handler and export it for both HTTP methods.
// This prevents duplicate-export errors.
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };