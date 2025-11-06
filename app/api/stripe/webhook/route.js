import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prismadb";

export const runtime = "nodejs";

export async function POST(req) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
  });

  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const email = session.customer_email;

      // Retrieve subscription details from Stripe
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription, {
          expand: ["items.data.price.product"],
        });

        const productName =
          subscription.items.data[0]?.price?.product?.name ||
          subscription.items.data[0]?.price?.nickname ||
          "Unknown Plan";

        // ✅ Update user's plan in Prisma DB
        await prisma.user.update({
          where: { email },
          data: { plan: productName },
        });

        console.log(`✅ Updated ${email} to plan: ${productName}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("❌ Error handling event:", err);
    return new NextResponse("Webhook handler error", { status: 500 });
  }
}