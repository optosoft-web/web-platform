import { relations } from "drizzle-orm";
import { date, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";
import { prescriptionTable } from "./prescription.table";
import { patientOpticalShops } from "./patient-optical-shop.table";

export const patientTable = pgTable("patients", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .references(() => authUsers.id, { onDelete: "cascade" }),
    fullName: varchar("full_name").notNull(),
    dateOfBirth: date("date_of_birth"),
    contactInfo: text("contact_info"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const patientsRelations = relations(patientTable, ({ many }) => ({
    prescriptions: many(prescriptionTable),
    patientOpticalShops: many(patientOpticalShops),
}));