import { opticalShopTable } from "@/server/database/tables";

export interface iClientContainerOpticalShopProps {
    opticalShopData: typeof opticalShopTable.$inferSelect;
}