import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { opticalShopTable } from "./optical-shop.table";
import { patientTable } from "./patient.table";
import { relations } from "drizzle-orm";

export const patientOpticalShops = pgTable(
    "patient_optical_shops",
    {
        patientId: uuid("patient_id")
            .notNull()
            .references(() => patientTable.id, { onDelete: "cascade" }),
        opticalShopId: uuid("optical_shop_id")
            .notNull()
            .references(() => opticalShopTable.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        primaryKey({ columns: [table.patientId, table.opticalShopId] }),
    ]
);

export const patientOpticalShopsRelations = relations(patientOpticalShops, ({ one }) => ({
    patient: one(patientTable, {
        fields: [patientOpticalShops.patientId],
        references: [patientTable.id],
    }),
    opticalShop: one(opticalShopTable, {
        fields: [patientOpticalShops.opticalShopId],
        references: [opticalShopTable.id],
    }),
}));