import db from "@/server/database/index";
import { subscriptionTable } from "@/server/database/tables";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;


async function createSubscription(userId: string, subscriptionId: string) {
  const newSubscription = await db.insert(subscriptionTable).values({
    id: subscriptionId,
    userId,
    quantity: 1,
    status: "active",
  }).execute()

  console.log(newSubscription)
}

async function updateSubscription(subscriptionId: string, priceId: string, planId: string, startPeriod: number, endPeriod: number) {
  const subscription = await db.update(subscriptionTable).set({
    priceId,
    planId,
    currentPeriodStart: new Date(startPeriod * 1000),
    currentPeriodEnd: new Date(endPeriod  * 1000),
  }).where(eq(subscriptionTable.id, subscriptionId)).execute()
  console.log(subscription)
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`⚠️  Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Lide com os diferentes tipos de eventos
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`Pagamento bem-sucedido para a sessão ${session.id}`);
      // console.log("nova session: ", JSON.stringify(session))
      console.log("Criar subscription")
      createSubscription(session.client_reference_id!, session.subscription!.toString())
      break;

    case "invoice.paid":
      const invoicePaid = event.data.object as Stripe.Invoice;
      // Lógica para renovações de assinatura bem-sucedidas
      // console.log("invoice: ", JSON.stringify(invoicePaid))
      console.log(`Fatura ${invoicePaid.id} paga.`);
      updateSubscription(invoicePaid.parent!.subscription_details!.subscription!.toString(),
        invoicePaid.lines.data[0].pricing!.price_details!.price,
        invoicePaid.lines.data[0].pricing!.price_details!.product,
        invoicePaid.period_start,
        invoicePaid.period_end,
      )
      break;

    case "invoice.payment_failed":
      const invoiceFailed = event.data.object as Stripe.Invoice;
      // Lógica para notificar o usuário sobre falha no pagamento
      console.log(`Falha no pagamento da fatura ${invoiceFailed.id}.`);
      break;

    case 'customer.subscription.deleted':
      // Lógica para remover o acesso do usuário quando a assinatura é cancelada
      console.log('Assinatura cancelada.');
      break;

    // ... adicione outros tipos de eventos que você queira monitorar
    default:
      console.warn(`🤷‍♀️ Evento não tratado: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}