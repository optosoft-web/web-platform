import { authUsers } from "drizzle-orm/supabase"
import { boolean, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { subscriptionTable } from "./subscription.table";

export const profileTypeEnum = pgEnum('profile_type', ['SUBSCRIPTION_OWNER', 'CLIENT']);


export const profileTable = pgTable('profiles', {
    id: uuid('id').primaryKey().references(() => authUsers.id, { onDelete: 'cascade' }),
    fullName: varchar('full_name', { length: 256 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    profileType: profileTypeEnum('type'),
    subscriptionId: text("subscription_id")
        .notNull()
        .references(() => subscriptionTable.id, { onDelete: "cascade" }),
    active: boolean('active').default(true),
    userId: uuid("user_id")
        .notNull()
        .references(() => authUsers.id, { onDelete: "cascade" }),
    optometristName: varchar("optometrist_name", { length: 256 }),
});