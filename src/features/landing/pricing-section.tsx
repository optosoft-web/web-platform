import { getSubscriptionPlans } from "@/actions/stripe.action";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscribeButton } from "./SubscribeButton";
import Stripe from "stripe";
import { Check, Star } from "lucide-react";

export async function PricingSection() {
  const plans = await getSubscriptionPlans();
  const featuredPlanName = "Optosoft Standard";

  return (
    <section id="planos" className="container py-20 md:py-32 mx-auto">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-4 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Planos e Preços Flexíveis
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Escolha o plano ideal para o seu consultório e comece a otimizar sua gestão hoje mesmo.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch max-w-6xl mx-auto">
          {plans.sort((a,b) => (a.default_price! as Stripe.Price).unit_amount! - (b.default_price! as Stripe.Price).unit_amount!).map((plan) => {
            const price = plan.default_price as Stripe.Price;
            const isFeatured = plan.name === featuredPlanName;

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col transition-transform duration-300 hover:scale-105 hover:shadow-2xl ${
                  isFeatured ? "border-primary border-2 shadow-xl" : "shadow-lg"
                }`}
              >
                {isFeatured && (
                  <div className="absolute top-0 right-4 -mt-4 bg-primary text-primary-foreground py-1 px-4 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Mais Popular
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                    <div>
                        <div className="mb-8 text-center">
                            <span className="text-5xl font-extrabold">
                            R$ {price.unit_amount ? (price.unit_amount / 100).toFixed(2) : "0.00"}
                            </span>
                            <span className="text-xl text-muted-foreground">
                            / {price.recurring?.interval === 'month' ? 'mês' : 'ano'}
                            </span>
                        </div>
                        <ul className="space-y-4">
                            {plan.marketing_features.map((feature, index) => (
                            <li key={`${plan.id}-feature-${index}`} className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-green-500 shrink-0 mt-1" />
                                <span className="text-muted-foreground">{feature.name}</span>
                            </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
                <CardFooter>
                  <SubscribeButton priceId={price.id} isFeatured={isFeatured} />
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}