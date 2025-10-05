import { date, integer, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";
import { patientTable } from "./patient.table";

export const prescriptionTable = pgTable("prescriptions", {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
        .notNull()
        .references(() => patientTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
        .notNull()
        .references(() => authUsers.id, { onDelete: "cascade" }),

    // Right Eye (OD)
    rightEyeSpherical: numeric("right_eye_spherical", { precision: 4, scale: 2 }),
    rightEyeCylindrical: numeric("right_eye_cylindrical", {
        precision: 4,
        scale: 2,
    }),
    rightEyeAxis: integer("right_eye_axis"),

    // Left Eye (OS)
    leftEyeSpherical: numeric("left_eye_spherical", { precision: 4, scale: 2 }),
    leftEyeCylindrical: numeric("left_eye_cylindrical", {
        precision: 4,
        scale: 2,
    }),
    leftEyeAxis: integer("left_eye_axis"),
    addition: numeric("addition", { precision: 4, scale: 2 }),
    notes: text("notes"),
    prescriptionDate: date("prescription_date").notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});