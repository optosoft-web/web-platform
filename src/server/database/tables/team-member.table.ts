import { boolean, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";
import { relations } from "drizzle-orm";
import { teamMemberOpticalShopTable } from "./team-member-optical-shop.table";

export const teamMemberTable = pgTable("team_members", {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
        .notNull()
        .references(() => authUsers.id, { onDelete: "cascade" }),
    memberUserId: uuid("member_user_id")
        .notNull()
        .references(() => authUsers.id, { onDelete: "cascade" }),
    fullName: varchar("full_name", { length: 256 }).notNull(),
    email: varchar("email", { length: 256 }).notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teamMemberRelations = relations(teamMemberTable, ({ many }) => ({
    opticalShops: many(teamMemberOpticalShopTable),
}));
