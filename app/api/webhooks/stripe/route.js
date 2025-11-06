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
