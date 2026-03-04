"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import {
    createBillingPortalSession,
    createCheckoutSession,
} from "@/server/actions/stripe.action";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CreditCard, RefreshCw, Check, Loader2 } from "lucide-react";
import Stripe from "stripe";

type SubscriptionData = {
    id: string;
    userId: string;
    stripeCustomerId: string | null;
    status: string | null;
    priceId: string | null;
    planId: string | null;
    currentPeriodEnd: Date;
} | null;

type BillingClientProps = {
    reason?: string;
    subscription: SubscriptionData;
    plans: Stripe.Product[];
};

const reasonMessages: Record<string, { title: string; description: string; icon: React.ReactNode }> = {
    no_subscription: {
        title: "Você ainda não possui uma assinatura",
        description: "Escolha um plano abaixo para começar a usar o Optosoft.",
        icon: <CreditCard className="h-12 w-12 text-muted-foreground" />,
    },
    canceled: {
        title: "Sua assinatura foi cancelada",
        description: "Para continuar usando o Optosoft, reative sua assinatura ou escolha um novo plano.",
        icon: <AlertCircle className="h-12 w-12 text-destructive" />,
    },
    past_due: {
        title: "Pagamento pendente",
        description: "Houve um problema com seu último pagamento. Atualize seu método de pagamento para continuar.",
        icon: <AlertCircle className="h-12 w-12 text-yellow-500" />,
    },
    unpaid: {
        title: "Pagamento não realizado",
        description: "Sua assinatura está suspensa por falta de pagamento. Atualize seus dados de pagamento.",
        icon: <AlertCircle className="h-12 w-12 text-destructive" />,
    },
    incomplete: {
        title: "Pagamento incompleto",
        description: "Sua assinatura requer uma ação adicional de pagamento (ex: autenticação 3D Secure).",
        icon: <RefreshCw className="h-12 w-12 text-yellow-500" />,
    },
    incomplete_expired: {
        title: "Assinatura expirada",
        description: "O tempo para completar o pagamento expirou. Escolha um plano para começar novamente.",
        icon: <AlertCircle className="h-12 w-12 text-destructive" />,
    },
};

export function BillingClient({ reason, subscription, plans }: BillingClientProps) {
    const router = useRouter();

    const isActive =
        subscription &&
        (subscription.status === "active" || subscription.status === "trialing");

    const message = reasonMessages[reason ?? ""] ?? reasonMessages.no_subscription;

    const hasStripeCustomer = !!subscription?.stripeCustomerId;
    const canManageViaPortal =
        hasStripeCustomer &&
        (isActive || ["past_due", "unpaid", "incomplete", "canceled"].includes(reason ?? ""));

    const { execute: executePortal, status: portalStatus } = useAction(
        createBillingPortalSession,
        {
            onSuccess: (data) => {
                if (data?.data?.url) {
                    router.push(data.data.url);
                }
            },
            onError: (error) => {
                console.error("Erro ao abrir portal:", error);
            },
        },
    );

    const { execute: executeCheckout, status: checkoutStatus } = useAction(
        createCheckoutSession,
        {
            onSuccess: (data) => {
                if (data?.data?.url) {
                    router.push(data.data.url);
                }
            },
            onError: (error) => {
                console.error("Erro ao criar checkout:", error);
            },
        },
    );

    const isPortalLoading = portalStatus === "executing";
    const isCheckoutLoading = checkoutStatus === "executing";

    // ── Active subscription view ──────────────────────────────────
    if (isActive) {
        const activePlan = plans.find((p) => {
            const price = p.default_price as Stripe.Price;
            return price.id === subscription.priceId;
        });
        const activePrice = activePlan?.default_price as Stripe.Price | undefined;

        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4">
                <div className="flex flex-col items-center gap-4 mb-10 text-center max-w-lg">
                    <Check className="h-12 w-12 text-green-500" />
                    <h1 className="text-2xl font-bold tracking-tight">Sua assinatura está ativa</h1>
                    <p className="text-muted-foreground text-lg">
                        {activePlan
                            ? `Plano ${activePlan.name} — R$ ${activePrice?.unit_amount ? (activePrice.unit_amount / 100).toFixed(2) : "—"} / ${activePrice?.recurring?.interval === "month" ? "mês" : "ano"}`
                            : "Plano ativo"}
                    </p>
                    {subscription.currentPeriodEnd && (
                        <p className="text-sm text-muted-foreground">
                            Próxima renovação:{" "}
                            {new Date(subscription.currentPeriodEnd).toLocaleDateString("pt-BR")}
                        </p>
                    )}
                </div>

                <div className="flex gap-4">
                    <Button
                        size="lg"
                        onClick={() => executePortal()}
                        disabled={isPortalLoading}
                    >
                        {isPortalLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Abrindo...
                            </>
                        ) : (
                            <>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Gerenciar assinatura
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => router.push("/admin/optical-shops")}
                    >
                        Voltar ao painel
                    </Button>
                </div>
            </div>
        );
    }

    // ── No subscription / problem view ────────────────────────────
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4">
            {/* Status message */}
            <div className="flex flex-col items-center gap-4 mb-10 text-center max-w-lg">
                {message.icon}
                <h1 className="text-2xl font-bold tracking-tight">{message.title}</h1>
                <p className="text-muted-foreground text-lg">{message.description}</p>
            </div>

            {/* If user has a Stripe customer, show portal button for payment issues */}
            {canManageViaPortal && (
                <div className="mb-10">
                    <Button
                        size="lg"
                        onClick={() => executePortal()}
                        disabled={isPortalLoading}
                    >
                        {isPortalLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Abrindo...
                            </>
                        ) : (
                            <>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Atualizar método de pagamento
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Plans grid */}
            <div className="w-full max-w-5xl">
                <h2 className="text-xl font-semibold text-center mb-6">
                    {canManageViaPortal ? "Ou escolha um novo plano" : "Escolha seu plano"}
                </h2>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                    {plans
                        .sort(
                            (a, b) =>
                                ((a.default_price as Stripe.Price)?.unit_amount ?? 0) -
                                ((b.default_price as Stripe.Price)?.unit_amount ?? 0),
                        )
                        .map((plan) => {
                            const price = plan.default_price as Stripe.Price;
                            return (
                                <Card key={plan.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow">
                                    <CardHeader className="text-center">
                                        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                                        <CardDescription>{plan.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <div className="mb-6 text-center">
                                            <span className="text-4xl font-extrabold">
                                                R${" "}
                                                {price.unit_amount
                                                    ? (price.unit_amount / 100).toFixed(2)
                                                    : "0.00"}
                                            </span>
                                            <span className="text-lg text-muted-foreground">
                                                / {price.recurring?.interval === "month" ? "mês" : "ano"}
                                            </span>
                                        </div>
                                        <ul className="space-y-3">
                                            {plan.marketing_features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                                                    <span className="text-sm text-muted-foreground">
                                                        {feature.name}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            className="w-full"
                                            size="lg"
                                            disabled={isCheckoutLoading}
                                            onClick={() => executeCheckout({ priceId: price.id })}
                                        >
                                            {isCheckoutLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Aguarde...
                                                </>
                                            ) : (
                                                "Assinar"
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}
