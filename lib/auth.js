import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prismadb";
import bcrypt from "bcryptjs";

export const authOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const { email, password } = credentials || {};
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = { id: user.id, name: user.name, email: user.email };
      return token;
    },
    async session({ session, token }) {
      if (token?.user) session.user = token.user;
      return session;
    },
  },
};