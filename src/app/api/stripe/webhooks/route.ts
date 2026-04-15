import db from "@/server/database/index";
import { subscriptionTable } from "@/server/database/tables";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type SubscriptionStatus =
  | "trialing"
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "unpaid";

function toDateOrNull(ts: number | null | undefined): Date | null {
  return ts ? new Date(ts * 1000) : null;
}

function toDate(ts: number): Date {
  return new Date(ts * 1000);
}

/**
 * Upsert a subscription row using the full Stripe Subscription object.
 * Called by most events to keep the local DB perfectly in sync.
 */
async function upsertSubscription(
  subscription: Stripe.Subscription,
  userId?: string,
) {
  const item = subscription.items.data[0]; // primary line-item
  const priceId = item?.price?.id ?? null;
  const planId =
    (typeof item?.price?.product === "string"
      ? item.price.product
      : item?.price?.product?.id) ?? null;

  const stripeCustomerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const values = {
    id: subscription.id,
    stripeCustomerId,
    status: subscription.status as SubscriptionStatus,
    priceId,
    planId,
    quantity: item?.quantity ?? 1,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    currentPeriodStart: toDate(item.current_period_start),
    currentPeriodEnd: toDate(item.current_period_end),
    cancelAt: toDateOrNull(subscription.cancel_at),
    canceledAt: toDateOrNull(subscription.canceled_at),
    endedAt: toDateOrNull(subscription.ended_at),
    trialStart: toDateOrNull(subscription.trial_start),
    trialEnd: toDateOrNull(subscription.trial_end),
  };

  // Try to update an existing row first.
  const updated = await db
    .update(subscriptionTable)
    .set(values)
    .where(eq(subscriptionTable.id, subscription.id))
    .execute();

  // drizzle-orm returns rowCount on postgres driver
  const rowCount = (updated as unknown as { rowCount: number }).rowCount ?? 0;

  // If no row existed, insert — but only if we have a valid userId.
  // Events like invoice.paid may fire before checkout.session.completed
  // when the row doesn't exist yet. In that case we skip the insert and
  // let checkout.session.completed handle it.
  if (rowCount === 0) {
    if (!userId) {
      console.warn(
        `⚠️ upsertSubscription — no existing row and no userId for ${subscription.id}; skipping insert.`,
      );
      return;
    }

    await db
      .insert(subscriptionTable)
      .values({ ...values, userId })
      .onConflictDoUpdate({
        target: subscriptionTable.id,
        set: values,
      })
      .execute();
  }
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
) {
  if (session.mode !== "subscription") return;

  const subscriptionId = session.subscription;
  const userId = session.client_reference_id;

  if (!subscriptionId || !userId) {
    console.error("checkout.session.completed: Missing subscriptionId or userId");
    return;
  }

  // Retrieve the full subscription object to have all fields
  const subscription = await stripe.subscriptions.retrieve(
    typeof subscriptionId === "string" ? subscriptionId : subscriptionId.id,
  );

  await upsertSubscription(subscription, userId);

  console.log(
    `✅ checkout.session.completed — subscription ${subscription.id} created for user ${userId}`,
  );
}

async function handleCustomerSubscriptionCreated(
  subscription: Stripe.Subscription,
) {
  // Try to resolve userId from existing row (set during checkout) or from
  // the Stripe customer metadata.
  const existing = await db.query.subscriptionTable.findFirst({
    where: eq(subscriptionTable.id, subscription.id),
  });

  const userId = existing?.userId ?? null;

  if (!userId) {
    // If we don't have the user yet, the checkout.session.completed handler
    // will take care of inserting. Log a warning for visibility.
    console.warn(
      `⚠️ customer.subscription.created — no userId found for ${subscription.id}; skipping.`,
    );
    return;
  }

  await upsertSubscription(subscription, userId);
  console.log(
    `✅ customer.subscription.created — ${subscription.id} (status: ${subscription.status})`,
  );
}

async function handleCustomerSubscriptionUpdated(
  subscription: Stripe.Subscription,
) {
  const existing = await db.query.subscriptionTable.findFirst({
    where: eq(subscriptionTable.id, subscription.id),
  });

  if (!existing) {
    console.warn(
      `⚠️ customer.subscription.updated — subscription ${subscription.id} not found in DB`,
    );
    return;
  }

  await upsertSubscription(subscription, existing.userId);
  console.log(
    `✅ customer.subscription.updated — ${subscription.id} → status: ${subscription.status}, cancelAtPeriodEnd: ${subscription.cancel_at_period_end}`,
  );
}

async function handleCustomerSubscriptionDeleted(
  subscription: Stripe.Subscription,
) {
  await db
    .update(subscriptionTable)
    .set({
      status: "canceled",
      endedAt: toDateOrNull(subscription.ended_at),
      canceledAt: toDateOrNull(subscription.canceled_at),
      cancelAt: toDateOrNull(subscription.cancel_at),
    })
    .where(eq(subscriptionTable.id, subscription.id))
    .execute();

  console.log(`✅ customer.subscription.deleted — ${subscription.id} canceled`);
}

async function handleCustomerSubscriptionTrialWillEnd(
  subscription: Stripe.Subscription,
) {
  // The trial ends in ~3 days. You can send a notification email here.
  console.log(
    `⏳ customer.subscription.trial_will_end — ${subscription.id} (trial ends ${new Date((subscription.trial_end ?? 0) * 1000).toISOString()})`,
  );

  // Keep local record up-to-date
  await upsertSubscription(subscription);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId =
    invoice.parent?.subscription_details?.subscription;

  if (!subscriptionId) {
    console.log(`ℹ️ invoice.paid — invoice ${invoice.id} has no subscription`);
    return;
  }

  const subId =
    typeof subscriptionId === "string" ? subscriptionId : subscriptionId.id;

  // Retrieve fresh subscription data and sync
  const subscription = await stripe.subscriptions.retrieve(subId);
  await upsertSubscription(subscription);

  console.log(
    `✅ invoice.paid — subscription ${subId} synced (invoice ${invoice.id})`,
  );
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId =
    invoice.parent?.subscription_details?.subscription;

  if (!subscriptionId) return;

  const subId =
    typeof subscriptionId === "string" ? subscriptionId : subscriptionId.id;

  // Mark subscription as past_due so the app can show a payment-failed banner
  await db
    .update(subscriptionTable)
    .set({ status: "past_due" })
    .where(eq(subscriptionTable.id, subId))
    .execute();

  console.log(
    `❌ invoice.payment_failed — subscription ${subId} marked past_due (invoice ${invoice.id})`,
  );
}

async function handleInvoicePaymentActionRequired(invoice: Stripe.Invoice) {
  const subscriptionId =
    invoice.parent?.subscription_details?.subscription;

  if (!subscriptionId) return;

  const subId =
    typeof subscriptionId === "string" ? subscriptionId : subscriptionId.id;

  // Status stays incomplete until the user completes the 3D-Secure / SCA flow
  await db
    .update(subscriptionTable)
    .set({ status: "incomplete" })
    .where(eq(subscriptionTable.id, subId))
    .execute();

  console.log(
    `🔐 invoice.payment_action_required — subscription ${subId} needs user action (invoice ${invoice.id})`,
  );
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown verification error";
    console.error(`⚠️ Webhook signature verification failed: ${message}`);
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      // ── Checkout ──────────────────────────────────────────────
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case "checkout.session.expired":
        console.log(
          `⏰ checkout.session.expired — ${(event.data.object as Stripe.Checkout.Session).id}`,
        );
        break;

      // ── Subscription lifecycle ────────────────────────────────
      case "customer.subscription.created":
        await handleCustomerSubscriptionCreated(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.updated":
        await handleCustomerSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.deleted":
        await handleCustomerSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.paused":
        console.log(
          `⏸️ customer.subscription.paused — ${(event.data.object as Stripe.Subscription).id}`,
        );
        await upsertSubscription(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.resumed":
        console.log(
          `▶️ customer.subscription.resumed — ${(event.data.object as Stripe.Subscription).id}`,
        );
        await upsertSubscription(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.trial_will_end":
        await handleCustomerSubscriptionTrialWillEnd(
          event.data.object as Stripe.Subscription,
        );
        break;

      // ── Invoices / Payments ───────────────────────────────────
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(
          event.data.object as Stripe.Invoice,
        );
        break;

      case "invoice.payment_action_required":
        await handleInvoicePaymentActionRequired(
          event.data.object as Stripe.Invoice,
        );
        break;

      case "invoice.upcoming":
        console.log(
          `📄 invoice.upcoming — customer ${(event.data.object as Stripe.Invoice).customer}`,
        );
        break;

      // ── Catch-all ─────────────────────────────────────────────
      default:
        console.warn(`🤷‍♀️ Unhandled event: ${event.type}`);
    }
  } catch (handlerError) {
    console.error(
      `❌ Error processing ${event.type} (${event.id}):`,
      handlerError,
    );
    // Return 200 so Stripe doesn't retry. Log the error for debugging.
    // If you want retries, return 500 instead.
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 200 },
    );
  }

  return NextResponse.json({ received: true });
}