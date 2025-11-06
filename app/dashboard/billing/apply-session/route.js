import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prismadb";

export async function POST(req) {
  const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET;
  if (!stripeKey) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }
  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const email = session.user.email;

  let sessionId;
  try {
    const body = await req.json();
    sessionId = body.session_id || body.sessionId;
  } catch {
    // ignore
  }
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    // 1) Retrieve checkout session
    const cs = await stripe.checkout.sessions.retrieve(sessionId);

    // Ensure this session is for the same user
    if (cs.customer_email && cs.customer_email !== email) {
      return NextResponse.json({ error: "Session email mismatch" }, { status: 403 });
    }

    // 2) Retrieve the subscription to get the price/product
    let planName = "Unknown Plan";
    if (cs.subscription) {
      const sub =
        typeof cs.subscription === "string"
          ? await stripe.subscriptions.retrieve(cs.subscription, {
              expand: ["items.data.price.product"],
            })
          : cs.subscription;

      const item = sub?.items?.data?.[0];
      const price = item?.price;
      planName =
        price?.product?.name || price?.nickname || price?.id || planName;

      // 3) Persist to your user
      await prisma.user.update({
        where: { email },
        data: { plan: planName },
      });
    }

    return NextResponse.json({ updated: true, plan: planName });
  } catch (e) {
    console.error("apply-session error", e);
    return NextResponse.json({ error: "Failed to apply session" }, { status: 500 });
  }
}