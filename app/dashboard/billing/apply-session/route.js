export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prismadb";

export async function POST(req) {
  const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET;
  if (!stripeKey) return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let sessionId;
  try {
    const body = await req.json();
    sessionId = body.session_id || body.sessionId;
  } catch {}
  if (!sessionId) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });

  try {
    // 1) Get Checkout Session
    const cs = await stripe.checkout.sessions.retrieve(sessionId);

    // Ensure same user
    if (cs.customer_email && cs.customer_email !== email) {
      return NextResponse.json({ error: "Session email mismatch" }, { status: 403 });
    }

    // 2) Read subscription -> price -> product name (plan)
    let planName = "Unknown Plan";
    if (cs.subscription) {
      const sub =
        typeof cs.subscription === "string"
          ? await stripe.subscriptions.retrieve(cs.subscription, { expand: ["items.data.price.product"] })
          : cs.subscription;

      const item = sub?.items?.data?.[0];
      const price = item?.price;
      planName = price?.product?.name || price?.nickname || price?.id || planName;

      // 3) Persist to DB
      await prisma.user.update({
        where: { email },
        data: { plan: planName },
      });
    }

    return NextResponse.json({ updated: true, plan: planName });
  } catch (e) {
    console.error("❌ apply-session error:", e);
    return NextResponse.json({ error: "Failed to apply session" }, { status: 500 });
  }
}