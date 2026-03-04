import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscribeButton } from "./SubscribeButton";
import Stripe from "stripe";
import { Badge } from "@/components/ui/badge";
import { Check, Clock } from "lucide-react";
import { getSubscriptionPlans } from "@/server/actions/stripe.action";

export async function PricingSection() {
    const plans = await getSubscriptionPlans();

    // Sort by price ascending
    const sortedPlans = plans.sort(
        (a, b) =>
            (a.default_price! as Stripe.Price).unit_amount! -
            (b.default_price! as Stripe.Price).unit_amount!
    );

    // Only the cheapest plan (basic) is available
    const basicPlanId = sortedPlans.length > 0 ? sortedPlans[0].id : null;

    return (
        <section id="planos" className="container py-20 md:py-32 mx-auto px-4">
            <div className="flex flex-col gap-12">
                <div className="flex flex-col gap-4 text-center max-w-3xl mx-auto">
                    <p className="text-sm font-semibold text-primary uppercase tracking-wider">
                        Planos
                    </p>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
                        Escolha o plano ideal
                    </h2>
                    <p className="text-lg text-muted-foreground text-pretty">
                        Comece com o plano Básico e migre conforme seu consultório crescer.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch max-w-6xl mx-auto">
                    {sortedPlans.map((plan) => {
                        const price = plan.default_price as Stripe.Price;
                        const isBasic = plan.id === basicPlanId;
                        const isAvailable = isBasic;

                        return (
                            <Card
                                key={plan.id}
                                className={`relative flex flex-col transition-all duration-300 hover:shadow-xl ${
                                    isBasic
                                        ? "border-primary border-2 shadow-lg scale-[1.02]"
                                        : "opacity-80"
                                }`}
                            >
                                {isBasic && (
                                    <div className="absolute top-0 right-4 -mt-3">
                                        <Badge className="bg-primary text-primary-foreground shadow-md">
                                            Disponível
                                        </Badge>
                                    </div>
                                )}
                                {!isAvailable && (
                                    <div className="absolute top-0 right-4 -mt-3">
                                        <Badge variant="secondary" className="shadow-md">
                                            <Clock className="h-3 w-3 mr-1" />
                                            Em breve
                                        </Badge>
                                    </div>
                                )}
                                <CardHeader className="text-center">
                                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                    <CardDescription className="text-base">
                                        {plan.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="mb-8 text-center">
                                            <span className="text-5xl font-extrabold">
                                                R${" "}
                                                {price.unit_amount
                                                    ? (price.unit_amount / 100)
                                                          .toFixed(2)
                                                          .replace(".", ",")
                                                    : "0,00"}
                                            </span>
                                            <span className="text-xl text-muted-foreground">
                                                /{" "}
                                                {price.recurring?.interval === "month"
                                                    ? "mês"
                                                    : "ano"}
                                            </span>
                                        </div>
                                        <ul className="space-y-4">
                                            {plan.marketing_features.map((feature, index) => (
                                                <li
                                                    key={`${plan.id}-feature-${index}`}
                                                    className="flex items-start gap-3"
                                                >
                                                    <Check
                                                        className={`h-5 w-5 shrink-0 mt-0.5 ${
                                                            isAvailable
                                                                ? "text-emerald-500"
                                                                : "text-muted-foreground/50"
                                                        }`}
                                                    />
                                                    <span
                                                        className={
                                                            isAvailable
                                                                ? "text-muted-foreground"
                                                                : "text-muted-foreground/50"
                                                        }
                                                    >
                                                        {feature.name}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    {isAvailable ? (
                                        <SubscribeButton
                                            priceId={price.id}
                                            isFeatured={true}
                                        />
                                    ) : (
                                        <button
                                            disabled
                                            className="w-full py-3 px-6 text-lg font-semibold rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                                        >
                                            Em breve
                                        </button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}