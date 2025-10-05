import { date, pgTable, primaryKey, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";
import { patientTable } from "./patient.table";
import { opticalShopTable } from "./optical-shop.table";

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
    (table) => ({
        pk: primaryKey({ columns: [table.patientId, table.opticalShopId] }),
    })
);