"use server";

import { z } from "zod";
import Stripe from "stripe";
import { actionClient } from "@/lib/safe-action";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const createCheckoutSessionSchema = z.object({
  priceId: z.string(),
});

export const createCheckoutSession = actionClient.inputSchema(createCheckoutSessionSchema).action(
  async ({ parsedInput }) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
      throw new Error(
        "A variável de ambiente NEXT_PUBLIC_APP_URL não está definida."
      );
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [
          {
            price: parsedInput.priceId,
            quantity: 1,
          },
        ],
        success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/cancel`,
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
    expand: ['data.default_price'],
  });

  return products.data.filter(product => product.default_price);
}