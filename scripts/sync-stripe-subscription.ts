/**
 * Script to manually sync Stripe subscriptions to the local database.
 *
 * Usage:
 *   npx tsx scripts/sync-stripe-subscription.ts
 *
 * This will:
 * 1. List recent checkout sessions from Stripe
 * 2. Find the ones with subscriptions that are NOT in the database
 * 3. Insert them into the subscriptions table
 */

import "dotenv/config";
import Stripe from "stripe";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import {
  subscriptionTable,
} from "../src/server/database/tables/subscription.table";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const client = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 });
const db = drizzle(client);

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

async function main() {
  console.log("🔍 Buscando checkout sessions recentes no Stripe...\n");

  // List recent completed checkout sessions
  const sessions = await stripe.checkout.sessions.list({
    limit: 20,
    status: "complete",
  });

  const subscriptionSessions = sessions.data.filter(
    (s) => s.mode === "subscription" && s.subscription && s.client_reference_id,
  );

  if (subscriptionSessions.length === 0) {
    console.log("❌ Nenhuma checkout session com subscription encontrada.");
    await client.end();
    return;
  }

  console.log(
    `📋 Encontradas ${subscriptionSessions.length} sessions com subscriptions:\n`,
  );

  let synced = 0;

  for (const session of subscriptionSessions) {
    const subId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription!.id;
    const userId = session.client_reference_id!;

    console.log(`  Session: ${session.id}`);
    console.log(`  Subscription: ${subId}`);
    console.log(`  User ID: ${userId}`);
    console.log(`  Customer email: ${session.customer_details?.email ?? "N/A"}`);

    // Check if already in DB
    const existing = await db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.id, subId))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  ✅ Já existe no banco (status: ${existing[0].status})\n`);
      continue;
    }

    // Retrieve full subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(subId);
    const item = subscription.items.data[0];
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
      userId,
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

    await db
      .insert(subscriptionTable)
      .values(values)
      .onConflictDoUpdate({
        target: subscriptionTable.id,
        set: values,
      })
      .execute();

    console.log(
      `  🎉 Subscription inserida no banco! (status: ${subscription.status})\n`,
    );
    synced++;
  }

  console.log(`\n✅ Sync completo. ${synced} subscription(s) sincronizada(s).`);
  await client.end();
}

main().catch((err) => {
  console.error("Erro:", err);
  process.exit(1);
});
