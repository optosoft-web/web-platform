import { date, integer, numeric, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";
import { patientTable } from "./patient.table";
import { opticalShopTable } from "./optical-shop.table";
import { relations } from "drizzle-orm";

export const prescriptionTable = pgTable("prescriptions", {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
        .notNull()
        .references(() => patientTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
        .notNull()
        .references(() => authUsers.id, { onDelete: "cascade" }),
    opticalShopId: uuid("optical_shop_id")
        .notNull()
        .references(() => opticalShopTable.id, { onDelete: "cascade" }),

    // Right Eye (OD)
    rightEyeSpherical: numeric("right_eye_spherical", { precision: 5, scale: 2 }),
    rightEyeCylindrical: numeric("right_eye_cylindrical", { precision: 5, scale: 2 }),
    rightEyeAxis: integer("right_eye_axis"),

    // Left Eye (OE)
    leftEyeSpherical: numeric("left_eye_spherical", { precision: 5, scale: 2 }),
    leftEyeCylindrical: numeric("left_eye_cylindrical", { precision: 5, scale: 2 }),
    leftEyeAxis: integer("left_eye_axis"),

    // Near vision
    addition: numeric("addition", { precision: 5, scale: 2 }),

    // DNP
    dnpRight: numeric("dnp_right", { precision: 4, scale: 1 }),
    dnpLeft: numeric("dnp_left", { precision: 4, scale: 1 }),

    notes: text("notes"),
    privateNotes: text("private_notes"),
    prescribedBy: varchar("prescribed_by", { length: 256 }),
    prescriptionDate: date("prescription_date").notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export const prescriptionRelations = relations(prescriptionTable, ({ one }) => ({
    patient: one(patientTable, {
        fields: [prescriptionTable.patientId],
        references: [patientTable.id],
    }),
    opticalShop: one(opticalShopTable, {
        fields: [prescriptionTable.opticalShopId],
        references: [opticalShopTable.id],
    }),
}));