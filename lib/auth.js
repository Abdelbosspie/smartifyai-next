// /lib/auth.js
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
// adjust this import to your actual prisma helper path:
import { prisma } from "@/lib/prismadb"; // or "@/lib/prismadb"

export const authOptions = {
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email:    { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide email and password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.password) throw new Error("Invalid credentials");

        const ok = await compare(credentials.password, user.password);
        if (!ok) throw new Error("Invalid credentials");

        // return the minimal session user
        return { id: user.id, name: user.name ?? "", email: user.email };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.sub) session.user.id = token.sub;
      return session;
    },
  },
};