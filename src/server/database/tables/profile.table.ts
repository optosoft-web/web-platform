import { authUsers } from "drizzle-orm/supabase"
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const profileTable = pgTable('profiles', {
    id: uuid('id').primaryKey().references(() => authUsers.id, { onDelete: 'cascade' }),
    fullName: varchar('full_name', { length: 256 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});