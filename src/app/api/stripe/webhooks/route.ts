import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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
      // Lógica para provisionar o acesso do usuário ao serviço
      // Ex: buscar o ID do usuário no `client_reference_id` ou `metadata` e atualizar seu status no banco de dados.
      break;

    case "invoice.paid":
      const invoicePaid = event.data.object as Stripe.Invoice;
      // Lógica para renovações de assinatura bem-sucedidas
      console.log(`Fatura ${invoicePaid.id} paga.`);
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