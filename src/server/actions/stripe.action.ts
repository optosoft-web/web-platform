"use server";

import { z } from "zod";
import Stripe from "stripe";
import { authMiddleware, createAction } from "@/lib/safe-action";
import db from "@/server/database/index";
import { subscriptionTable } from "@/server/database/tables";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------

const createCheckoutSessionSchema = z.object({
  priceId: z.string(),
});

export const createCheckoutSession = createAction
  .inputSchema(createCheckoutSessionSchema)
  .use(authMiddleware)
  .action(async ({ parsedInput, ctx }) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const user = ctx.user;
    if (!appUrl) {
      throw new Error(
        "A variável de ambiente NEXT_PUBLIC_APP_URL não está definida.",
      );
    }

    // Check if user already has an active subscription
    const existingSub = await db.query.subscriptionTable.findFirst({
      where: eq(subscriptionTable.userId, user.id),
    });

    // If there's already an active/trialing subscription, redirect to billing portal instead
    if (
      existingSub &&
      (existingSub.status === "active" || existingSub.status === "trialing")
    ) {
      if (existingSub.stripeCustomerId) {
        try {
          const customer = await stripe.customers.retrieve(existingSub.stripeCustomerId);
          // If customer exists and is not deleted, open billing portal
          if (!("deleted" in customer && customer.deleted)) {
            const portalSession = await stripe.billingPortal.sessions.create({
              customer: existingSub.stripeCustomerId,
              return_url: `${appUrl}/admin`,
            });
            return { url: portalSession.url };
          }
        } catch {
          // Customer doesn't exist on Stripe — fall through to create new checkout
        }
      }
    }

    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      line_items: [{ price: parsedInput.priceId, quantity: 1 }],
      client_reference_id: user.id,
      success_url: `${appUrl}/admin`,
      cancel_url: `${appUrl}/?status=cancel`,
      subscription_data: {
        metadata: { userId: user.id },
      },
    };

    // If we know the customer from a previous (canceled) subscription, reuse it
    if (existingSub?.stripeCustomerId) {
      // Verify the customer still exists in Stripe before reusing
      try {
        await stripe.customers.retrieve(existingSub.stripeCustomerId);
        checkoutParams.customer = existingSub.stripeCustomerId;
      } catch {
        // Customer was deleted from Stripe — fall back to email
        checkoutParams.customer_email = user.email;
      }
    } else {
      checkoutParams.customer_email = user.email;
    }

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create(checkoutParams);
    } catch (err) {
      console.error("Stripe checkout error:", err);
      throw err;
    }

    if (!session.url) {
      throw new Error("Não foi possível criar a sessão de checkout.");
    }

    return { url: session.url };
  });

// ---------------------------------------------------------------------------
// Billing Portal (manage subscription, cancel, update payment method)
// ---------------------------------------------------------------------------

export const createBillingPortalSession = createAction
  .use(authMiddleware)
  .action(async ({ ctx }) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const user = ctx.user;
    if (!appUrl) {
      throw new Error(
        "A variável de ambiente NEXT_PUBLIC_APP_URL não está definida.",
      );
    }

    // Find the user's subscription to get the Stripe customer ID
    const existingSub = await db.query.subscriptionTable.findFirst({
      where: eq(subscriptionTable.userId, user.id),
    });

    if (!existingSub || !existingSub.stripeCustomerId) {
      throw new Error("Nenhuma assinatura encontrada para este usuário.");
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: existingSub.stripeCustomerId,
      return_url: `${appUrl}/admin`,
    });

    return { url: portalSession.url };
  });

// ---------------------------------------------------------------------------
// Product catalog
// ---------------------------------------------------------------------------

export async function getSubscriptionPlans() {
  const products = await stripe.products.list({
    active: true,
    expand: ["data.default_price", "data"],
  });

  return products.data.filter(
    (product) =>
      product.default_price &&
      (product.default_price as Stripe.Price).type === "recurring",
  );
}

// ---------------------------------------------------------------------------
// Subscription status helper (for server components / middleware)
// ---------------------------------------------------------------------------

export async function getUserSubscription(userId: string) {
  const subscription = await db.query.subscriptionTable.findFirst({
    where: eq(subscriptionTable.userId, userId),
  });

  if (!subscription) return null;

  const isActive =
    subscription.status === "active" || subscription.status === "trialing";

  return {
    ...subscription,
    isActive,
  };
}