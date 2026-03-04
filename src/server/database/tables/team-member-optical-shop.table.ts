import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { teamMemberTable } from "./team-member.table";
import { opticalShopTable } from "./optical-shop.table";

export const teamMemberOpticalShopTable = pgTable(
    "team_member_optical_shops",
    {
        teamMemberId: uuid("team_member_id")
            .notNull()
            .references(() => teamMemberTable.id, { onDelete: "cascade" }),
        opticalShopId: uuid("optical_shop_id")
            .notNull()
            .references(() => opticalShopTable.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        primaryKey({ columns: [table.teamMemberId, table.opticalShopId] }),
    ]
);

export const teamMemberOpticalShopRelations = relations(teamMemberOpticalShopTable, ({ one }) => ({
    teamMember: one(teamMemberTable, {
        fields: [teamMemberOpticalShopTable.teamMemberId],
        references: [teamMemberTable.id],
    }),
    opticalShop: one(opticalShopTable, {
        fields: [teamMemberOpticalShopTable.opticalShopId],
        references: [opticalShopTable.id],
    }),
}));
