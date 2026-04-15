import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";
import { patientOpticalShops } from "./patient-optical-shop.table";

export const opticalShopTable = pgTable("optical_shops", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .references(() => authUsers.id, { onDelete: "cascade" }),
    name: varchar("name").notNull(),
    address: text("address"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const opticalShopsRelations = relations(opticalShopTable, ({ many }) => ({
    patientOpticalShops: many(patientOpticalShops),
}));