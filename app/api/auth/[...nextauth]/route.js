import { prisma } from "@/lib/prismadb";
import { compare } from "bcryptjs";

export const authOptions = {
  providers: [
    {
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide both email and password");
        }

        // find user in Prisma
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) throw new Error("No user found with this email");

        // compare hashed password
        const isValid = await compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    },
  ],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
};

import NextAuth from "next-auth";
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };