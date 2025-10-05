"use server";

import { z } from "zod";
import Stripe from "stripe";
import { authMiddleware, createAction } from "@/lib/safe-action";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const createCheckoutSessionSchema = z.object({
  priceId: z.string(),
});

export const createCheckoutSession = createAction.inputSchema(createCheckoutSessionSchema).use(authMiddleware).action(
  async ({ parsedInput, ctx }) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const user = ctx.user;
    if (!appUrl) {
      throw new Error(
        "A variável de ambiente NEXT_PUBLIC_APP_URL não está definida."
      );
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: parsedInput.priceId, quantity: 1 }],
        customer_email: user.email,
        client_reference_id: user.id,
        success_url: `${appUrl}/admin/dashboard`,
        cancel_url: `${appUrl}/pricing?status=cancel`,
      });

      if (!session.url) {
        throw new Error("Não foi possível criar a sessão de checkout.");
      }

      return { url: session.url };

    } catch (error) {
      console.error("Erro ao criar a sessão de checkout:", error);
      throw error;
    }
  })

export async function getSubscriptionPlans() {
  const products = await stripe.products.list({
    active: true,
    expand: ['data.default_price', 'data'],
  });

  return products.data.filter(product => product.default_price && (product.default_price as Stripe.Price).type == "recurring");
}