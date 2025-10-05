import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";
import { sql } from "drizzle-orm";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
    "trialing",
    "active",
    "canceled",
    "incomplete",
    "incomplete_expired",
    "past_due",
    "unpaid",
]);

export const subscriptionTable = pgTable("subscriptions", {
    id: text("id").primaryKey(), // Stripe's Subscription ID (e.g., "sub_...")
    userId: uuid("user_id")
        .notNull()
        .references(() => authUsers.id, { onDelete: "cascade" }),
    status: subscriptionStatusEnum("status"),
    priceId: text("price_id"), // Stripe's Price ID (e.g., "price_...")
    quantity: integer("quantity"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end"),
    created: timestamp("created", { withTimezone: true })
        .notNull()
        .default(sql`timezone('utc'::text, now())`),
    currentPeriodStart: timestamp("current_period_start", {
        withTimezone: true,
    })
        .notNull()
        .default(sql`timezone('utc'::text, now())`),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true })
        .notNull()
        .default(sql`timezone('utc'::text, now())`),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    cancelAt: timestamp("cancel_at", { withTimezone: true }),
    canceledAt: timestamp("canceled_at", { withTimezone: true }),
    trialStart: timestamp("trial_start", { withTimezone: true }),
    trialEnd: timestamp("trial_end", { withTimezone: true }),
});