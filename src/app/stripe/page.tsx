// O botão que usa a action

import { getSubscriptionPlans } from "@/actions/stripe.action";
import { SubscribeButton } from "@/features/landing/SubscribeButton";
import Stripe from "stripe";

export default async function PricingPage() {
  const plans = await getSubscriptionPlans();

  return (
    <div>
      <h1>Nossos Planos</h1>
      <div style={{ display: "flex", gap: "16px" }}>
        {plans.map((plan) => {
          const price = plan.default_price as Stripe.Price;
          return (
            <div key={plan.id} style={{ border: "1px solid #ccc", padding: "16px" }}>
              <h2>{plan.name}</h2>
              <p>{plan.description}</p>
              <p>
                R$ {price.unit_amount ? (price.unit_amount / 100).toFixed(2) : 0} / {price.recurring?.interval}
              </p>
              <SubscribeButton priceId={price.id} />
            </div>
          );
        })}
      </div>
    </div>
  );
}