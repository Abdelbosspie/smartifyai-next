#!/usr/bin/env bash
set -e

echo "==> Creating backend folders…"
mkdir -p prisma lib app/api/auth/\[...nextauth] app/api/register app/api/checkout app/api/webhooks/stripe app/api/agents app/api/contact app/signup app/login app/dashboard

echo "==> Installing dependencies…"
npm i prisma @prisma/client next-auth @auth/prisma-adapter bcrypt stripe nodemailer

echo "==> prisma/schema.prisma"
if [ -f prisma/schema.prisma ]; then echo "    (exists, skipping)"; else cat > prisma/schema.prisma <<'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // or "sqlite" for local: file:./dev.db
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(cuid())
  name          String?
  email         String?  @unique
  image         String?
  password      String?
  emailVerified DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  accounts      Account[]
  sessions      Session[]
  subscription  Subscription?
  agents        Agent[]
}

model Subscription {
  id               String   @id @default(cuid())
  userId           String   @unique
  plan             Plan     @default(FREE)
  stripeCustomer   String?
  stripeSubId      String?
  status           String?
  currentPeriodEnd DateTime?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  user             User     @relation(fields: [userId], references: [id])
}

enum Plan {
  FREE
  HOBBY
  STANDARD
  PRO
  ENTERPRISE
}

model Agent {
  id        String   @id @default(cuid())
  userId    String
  name      String
  type      String
  config    Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id])
}

model Conversation {
  id        String   @id @default(cuid())
  agentId   String
  userId    String?
  channel   String
  createdAt DateTime @default(now())

  agent     Agent    @relation(fields: [agentId], references: [id])
  messages  Message[]
}

model Message {
  id             String   @id @default(cuid())
  conversationId String
  role           String
  content        String
  createdAt      DateTime @default(now())

  conversation   Conversation @relation(fields: [conversationId], references: [id])
}

model ContactSubmission {
  id          String   @id @default(cuid())
  name        String
  email       String
  company     String?
  industry    String?
  projectType String?
  budget      String?
  message     String
  createdAt   DateTime @default(now())
}

/*** NextAuth models ***/
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id])

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}
EOF
fi

echo "==> lib/prismadb.js"
if [ -f lib/prismadb.js ]; then echo "    (exists, skipping)"; else cat > lib/prismadb.js <<'EOF'
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;
export const prisma =
  globalForPrisma.prisma || new PrismaClient({ log: ["warn", "error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
EOF
fi

echo "==> lib/limits.js"
if [ -f lib/limits.js ]; then echo "    (exists, skipping)"; else cat > lib/limits.js <<'EOF'
export const PLAN_LIMITS = {
  FREE: { agents: 1 },
  HOBBY: { agents: 1 },
  STANDARD: { agents: 2 },
  PRO: { agents: 3 },
  ENTERPRISE: { agents: 999 },
};
EOF
fi

echo "==> lib/subscription.js"
if [ -f lib/subscription.js ]; then echo "    (exists, skipping)"; else cat > lib/subscription.js <<'EOF'
import { prisma } from "./prismadb";
export async function getUserPlan(userId) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  return sub?.plan || "FREE";
}
EOF
fi

echo "==> lib/auth.js"
if [ -f lib/auth.js ]; then echo "    (exists, skipping)"; else cat > lib/auth.js <<'EOF'
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prismadb";
import bcrypt from "bcrypt";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds) => {
        const user = await prisma.user.findUnique({ where: { email: creds.email } });
        if (!user || !user.password) return null;
        const ok = await bcrypt.compare(creds.password, user.password);
        if (!ok) return null;
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) { if (user) token.uid = user.id; return token; },
    async session({ session, token }) { if (token?.uid) session.user.id = token.uid; return session; },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
EOF
fi

echo "==> app/api/auth/[...nextauth]/route.js"
if [ -f app/api/auth/\[...nextauth]/route.js ]; then echo "    (exists, skipping)"; else cat > app/api/auth/\[...nextauth]/route.js <<'EOF'
export { handlers as GET, handlers as POST } from "@/lib/auth";
EOF
fi

echo "==> app/api/register/route.js"
if [ -f app/api/register/route.js ]; then echo "    (exists, skipping)"; else cat > app/api/register/route.js <<'EOF'
import { prisma } from "@/lib/prismadb";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return new Response(JSON.stringify({ error: "Email already in use" }), { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name || "",
        email,
        password: hash,
        subscription: { create: { plan: "FREE" } },
      },
      select: { id: true, email: true, name: true },
    });

    return new Response(JSON.stringify({ user }), { status: 201 });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
EOF
fi

echo "==> app/api/checkout/route.js"
if [ -f app/api/checkout/route.js ]; then echo "    (exists, skipping)"; else cat > app/api/checkout/route.js <<'EOF'
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prismadb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PLAN_TO_PRICE = {
  HOBBY: process.env.STRIPE_PRICE_HOBBY,
  STANDARD: process.env.STRIPE_PRICE_STANDARD,
  PRO: process.env.STRIPE_PRICE_PRO,
};

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const { plan } = await req.json();
  if (!PLAN_TO_PRICE[plan]) return new Response(JSON.stringify({ error: "Invalid plan" }), { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { subscription: true } });

  let customerId = user.subscription?.stripeCustomer;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email || undefined,
      name: user.name || undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.subscription.upsert({
      where: { userId: user.id },
      create: { userId: user.id, plan: "FREE", stripeCustomer: customerId },
      update: { stripeCustomer: customerId },
    });
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: PLAN_TO_PRICE[plan], quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/pricing?success=1`,
    cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=1`,
    metadata: { userId: user.id, plan },
  });

  return new Response(JSON.stringify({ url: checkout.url }), { status: 200 });
}
EOF
fi

echo "==> app/api/webhooks/stripe/route.js"
if [ -f app/api/webhooks/stripe/route.js ]; then echo "    (exists, skipping)"; else cat > app/api/webhooks/stripe/route.js <<'EOF'
import Stripe from "stripe";
import { prisma } from "@/lib/prismadb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const payload = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return new Response("Bad signature", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;
      const subId = session.subscription;
      if (userId && plan && subId) {
        const stripeSub = await stripe.subscriptions.retrieve(subId);
        await prisma.subscription.update({
          where: { userId },
          data: {
            plan,
            stripeSubId: stripeSub.id,
            status: stripeSub.status,
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          },
        });
      }
    }

    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object;
      await prisma.subscription.updateMany({
        where: { stripeSubId: sub.id },
        data: {
          status: sub.status,
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
      });
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object;
      await prisma.subscription.updateMany({
        where: { stripeSubId: sub.id },
        data: { status: "canceled" },
      });
    }

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response("Webhook handler failed", { status: 500 });
  }
}
EOF
fi

echo "==> app/api/agents/route.js"
if [ -f app/api/agents/route.js ]; then echo "    (exists, skipping)"; else cat > app/api/agents/route.js <<'EOF'
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prismadb";
import { PLAN_LIMITS } from "@/lib/limits";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const agents = await prisma.agent.findMany({ where: { userId: session.user.id } });
  return new Response(JSON.stringify({ agents }), { status: 200 });
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { name, type, config } = await req.json();

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { subscription: true } });
  const plan = user.subscription?.plan || "FREE";
  const limit = PLAN_LIMITS[plan]?.agents ?? 1;
  const count = await prisma.agent.count({ where: { userId: user.id } });
  if (count >= limit) {
    return new Response(JSON.stringify({ error: `Agent limit reached for ${plan}` }), { status: 403 });
  }

  const agent = await prisma.agent.create({
    data: { userId: user.id, name, type: type || "chatbot", config: config || {} },
  });

  return new Response(JSON.stringify({ agent }), { status: 201 });
}
EOF
fi

echo "==> app/api/contact/route.js"
if [ -f app/api/contact/route.js ]; then echo "    (exists, skipping)"; else cat > app/api/contact/route.js <<'EOF'
import { prisma } from "@/lib/prismadb";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, company, industry, projectType, budget, message } = body;

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), { status: 400 });
    }

    await prisma.contactSubmission.create({
      data: { name, email, company, industry, projectType, budget, message },
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      replyTo: email,
      to: process.env.EMAIL_USER,
      subject: `New SmartifyAI Inquiry from ${name}`,
      text: `New Inquiry:
Name: ${name}
Email: ${email}
Company: ${company || "-"}
Industry: ${industry || "-"}
Project Type: ${projectType || "-"}
Budget: ${budget || "-"}

Message:
${message}
`,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    console.error("Contact error:", e);
    return new Response(JSON.stringify({ success: false, error: "Server error" }), { status: 500 });
  }
}
EOF
fi

echo "==> app/signup/page.jsx"
if [ -f app/signup/page.jsx ]; then echo "    (exists, skipping)"; else cat > app/signup/page.jsx <<'EOF'
"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const body = {
      name: e.target.name.value,
      email: e.target.email.value,
      password: e.target.password.value,
    };
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      await signIn("credentials", { email: body.email, password: body.password, callbackUrl: "/dashboard" });
    } else {
      alert("Sign up failed");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <nav className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-gray-200 bg-white">
        <a href="/" className="text-2xl font-bold">Smartify<span className="text-indigo-600">AI</span></a>
        <a href="/login" className="text-sm text-indigo-700">Log in</a>
      </nav>
      <section className="max-w-md mx-auto py-16 px-6">
        <h1 className="text-3xl font-semibold mb-6">Create your account</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input name="name" placeholder="Full name" className="w-full border rounded-lg px-4 py-3" />
          <input name="email" type="email" placeholder="Email" className="w-full border rounded-lg px-4 py-3" required />
          <input name="password" type="password" placeholder="Password" className="w-full border rounded-lg px-4 py-3" required />
          <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-3">
            {loading ? "Creating…" : "Sign up"}
          </button>
        </form>
      </section>
    </main>
  );
}
EOF
fi

echo "==> app/login/page.jsx"
if [ -f app/login/page.jsx ]; then echo "    (exists, skipping)"; else cat > app/login/page.jsx <<'EOF'
"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const email = e.target.email.value;
    const password = e.target.password.value;
    const res = await signIn("credentials", { email, password, redirect: true, callbackUrl: "/dashboard" });
    if (!res?.ok) alert("Login failed");
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <nav className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-gray-200 bg-white">
        <a href="/" className="text-2xl font-bold">Smartify<span className="text-indigo-600">AI</span></a>
        <a href="/signup" className="text-sm text-indigo-700">Sign up</a>
      </nav>
      <section className="max-w-md mx-auto py-16 px-6">
        <h1 className="text-3xl font-semibold mb-6">Welcome back</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input name="email" type="email" placeholder="Email" className="w-full border rounded-lg px-4 py-3" required />
          <input name="password" type="password" placeholder="Password" className="w-full border rounded-lg px-4 py-3" required />
          <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-3">
            {loading ? "Signing in…" : "Log in"}
          </button>
        </form>
      </section>
    </main>
  );
}
EOF
fi

echo "==> app/dashboard/page.jsx"
if [ -f app/dashboard/page.jsx ]; then echo "    (exists, skipping)"; else cat > app/dashboard/page.jsx <<'EOF'
export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";

export default async function Dashboard() {
  const session = await auth();
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <nav className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-gray-200 bg-white">
        <a href="/" className="text-2xl font-bold">Smartify<span className="text-indigo-600">AI</span></a>
        <div className="text-sm text-gray-600">Hi, {session?.user?.email || "guest"}</div>
      </nav>
      <section className="max-w-3xl mx-auto py-16 px-6">
        <h1 className="text-3xl font-semibold mb-4">Dashboard</h1>
        <p className="text-gray-600">You’re signed in. Build agents, connect channels, and manage your plan here.</p>
      </section>
    </main>
  );
}
EOF
fi

echo "==> Done."
echo "Next steps:"
echo "  1) Add env vars to .env (DATABASE_URL, NEXTAUTH_*, EMAIL_*, STRIPE_*)"
echo "  2) npx prisma generate && npx prisma migrate dev --name init"
echo "  3) Start dev: npm run dev"