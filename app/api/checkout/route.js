export const runtime = "nodejs";

import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

async function getOrCreateCustomer(stripe, email) {
  if (!email) return undefined;
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length) return existing.data[0].id;
  const created = await stripe.customers.create({ email });
  return created.id;
}

export async function POST(req) {
  const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET;
  if (!stripeKey) return new Response(JSON.stringify({ error: "Stripe not configured" }), { status: 500 });

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

  let body = {};
  try {
    body = await req.json();
  } catch {}
  const { action, priceId } = body;

  const origin = process.env.NEXT_PUBLIC_APP_URL || req.headers.get("origin") || "http://localhost:3000";
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || undefined;

  if (action === "portal") {
    // Billing portal requires a customer ID (not email)
    const customer = await getOrCreateCustomer(stripe, email);
    if (!customer) return Response.json({ error: "No customer" }, { status: 400 });

    const portal = await stripe.billingPortal.sessions.create({
      customer,
      return_url: `${origin}/dashboard/billing`,
    });
    return Response.json({ url: portal.url });
  }

  if (action === "checkout") {
    const finalPriceId =
      priceId ||
      process.env.NEXT_PUBLIC_STRIPE_PRICE_HOBBY ||
      process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD ||
      process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;

    if (!finalPriceId) return Response.json({ error: "No STRIPE_PRICE_ID set." }, { status: 400 });

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: finalPriceId, quantity: 1 }],
      allow_promotion_codes: true,
      customer_email: email,
      success_url: `${origin}/dashboard/billing?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/billing?canceled=1`,
    });

    return Response.json({ url: checkout.url });
  }

  return Response.json({ error: "Unsupported action" }, { status: 400 });
}