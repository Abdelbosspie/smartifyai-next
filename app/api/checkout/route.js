import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth"; // adjust if your alias differs

const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET;
const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

export async function POST(req) {
  try {
    if (!stripeKey) {
      return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
    }

    const session = await getServerSession(authOptions).catch(() => null);
    const body = await req.json().catch(() => ({}));
    const { action = "checkout", priceId, productId } = body;

    const headers = Object.fromEntries(req.headers);
    const origin = headers["origin"] || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const email = session?.user?.email;

    // Open Billing Portal
    if (action === "portal") {
      if (!email) {
        return NextResponse.json({ error: "Sign in required to manage billing." }, { status: 401 });
      }
      // Find or create a customer by email
      let customerId;
      const existing = await stripe.customers.list({ email, limit: 1 });
      if (existing?.data?.length) {
        customerId = existing.data[0].id;
      } else {
        const created = await stripe.customers.create({ email });
        customerId = created.id;
      }
      const portal = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${origin}/dashboard/billing`,
      });
      return NextResponse.json({ url: portal.url });
    }

    // Resolve the price to use for Checkout
    let finalPriceId = priceId;

    // If only productId provided, resolve its default or first recurring active price
    if (!finalPriceId && productId) {
      const product = await stripe.products.retrieve(productId);
      if (product?.default_price) {
        finalPriceId =
          typeof product.default_price === "string"
            ? product.default_price
            : product.default_price.id;
      }
      if (!finalPriceId) {
        const prices = await stripe.prices.list({
          product: productId,
          active: true,
          type: "recurring",
          limit: 1,
        });
        finalPriceId = prices?.data?.[0]?.id || null;
      }
    }

    // Fallback to env if nothing passed
    if (!finalPriceId) {
      finalPriceId = process.env.STRIPE_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || null;
    }

    if (!finalPriceId) {
      return NextResponse.json(
        { error: "Missing priceId. Pass { priceId } (preferred), or set STRIPE_PRICE_ID." },
        { status: 400 }
      );
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: finalPriceId, quantity: 1 }],
      allow_promotion_codes: true,
      customer_email: email, // ok if undefined
      success_url: `${origin}/dashboard/billing?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/billing?canceled=1`,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (e) {
    console.error("/api/checkout error", e);
    return NextResponse.json({ error: "Failed to start billing flow." }, { status: 500 });
  }
}