import { getUserSubscription } from "@/server/actions/admin/subscription.action";
import { BillingClient } from "./_components/billing-client";
import { getSubscriptionPlans } from "@/server/actions/stripe.action";

export default async function BillingPage({
    searchParams,
}: {
    searchParams: Promise<{ reason?: string }>;
}) {
    const { reason } = await searchParams;
    const subscription = await getUserSubscription();
    const plans = await getSubscriptionPlans();

    return (
        <BillingClient
            reason={reason}
            subscription={subscription.data ?? null}
            plans={plans}
        />
    );
}
