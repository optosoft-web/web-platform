"use server";

import { z } from "zod";
import { and, asc, count, eq } from "drizzle-orm";
import db from "@/server/database/index";
import { opticalShopTable, patientOpticalShops } from "@/server/database/tables";
import { authMiddleware, createAction } from "@/lib/safe-action";
import { iOpticalShopCardProps } from "@/app/admin/optical-shops/_components/card-optical-shop/card-optical-shop.types";
import { formatDate } from "@/lib/utils";

const opticalShopSchema = z.object({
  name: z.string().min(2, "O nome da ótica é obrigatório."),
  address: z.string().optional(),
});
export const ActionCreateOpticalShop = createAction.inputSchema(opticalShopSchema).use(authMiddleware).action(
  async ({ parsedInput, ctx }) => {
    try {
      const [newShop] = await db.insert(opticalShopTable).values({
        userId: ctx.user.id,
        name: parsedInput.name,
        address: parsedInput.address,
      }).returning();

      return newShop;
    } catch (error) {
      console.error("Erro ao criar ótica:", error);
      throw new Error("Não foi possível criar a ótica.");
    }
  }
);

export const ActionGetOpticalShopsForCards = createAction.use(authMiddleware).action(
  async ({ ctx }): Promise<iOpticalShopCardProps[]> => {
    try {
      const shopsData = await db
        .select({
          id: opticalShopTable.id,
          name: opticalShopTable.name,
          address: opticalShopTable.address,
          createdAt: opticalShopTable.createdAt,
          totalPatients: count(patientOpticalShops.patientId),
        })
        .from(opticalShopTable)
        .leftJoin(
          patientOpticalShops,
          eq(opticalShopTable.id, patientOpticalShops.opticalShopId)
        )
        .where(eq(opticalShopTable.userId, ctx.user.id))
        .groupBy(opticalShopTable.id)
        .orderBy(asc(opticalShopTable.name));

      const shops: iOpticalShopCardProps[] = shopsData.map((shop) => ({
        ...shop,
        totalPatients: Number(shop.totalPatients),
        createdAt: formatDate(shop.createdAt),
      }));

      return shops;

    } catch (error) {
      console.error("Erro ao buscar óticas:", error);
      throw new Error("Não foi possível buscar as óticas.");
    }
  }
);

export const ActionGetOpticalShops = createAction.use(authMiddleware).action(
  async ({ ctx }) => {
    try {
      const shops = await db.query.opticalShopTable.findMany({
        where: eq(opticalShopTable.userId, ctx.user.id),
        orderBy: (shops, { asc }) => [asc(shops.name)],
      });
      return shops;
    } catch (error) {
      console.error("Erro ao buscar óticas:", error);
      throw new Error("Não foi possível buscar as óticas.");
    }
  }
);

const updateOpticalShopSchema = opticalShopSchema.extend({
  id: z.string(),
});
export const updateOpticalShop = createAction.inputSchema(updateOpticalShopSchema).use(authMiddleware).action(
  async ({ parsedInput, ctx }) => {
    try {
      const [updatedShop] = await db.update(opticalShopTable)
        .set({
          name: parsedInput.name,
          address: parsedInput.address,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(opticalShopTable.id, parsedInput.id),
            eq(opticalShopTable.userId, ctx.user.id)
          )
        )
        .returning();

      if (!updatedShop) {
        throw new Error("Ótica não encontrada ou acesso negado.");
      }

      return updatedShop;
    } catch (error) {
      console.error("Erro ao atualizar ótica:", error);
      throw error;
    }
  }
);

const deleteOpticalShopSchema = z.object({
  id: z.string(),
});
export const deleteOpticalShop = createAction.inputSchema(deleteOpticalShopSchema).use(authMiddleware).action(
  async ({ parsedInput, ctx }) => {
    try {
      const shop = await db.query.opticalShopTable.findFirst({
        where: and(
          eq(opticalShopTable.id, parsedInput.id),
          eq(opticalShopTable.userId, ctx.user.id)
        )
      });

      if (!shop) {
        throw new Error("Ótica não encontrada ou acesso negado.");
      }

      await db.delete(patientOpticalShops).where(eq(patientOpticalShops.opticalShopId, parsedInput.id));

      await db.delete(opticalShopTable).where(eq(opticalShopTable.id, parsedInput.id));

      return { success: true, message: "Ótica deletada com sucesso." };
    } catch (error) {
      console.error("Erro ao deletar ótica:", error);
      throw error;
    }
  }
);