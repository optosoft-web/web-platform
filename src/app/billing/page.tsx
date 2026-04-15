import { getUserSubscription } from "@/server/actions/admin/subscription.action";
import { BillingClient } from "./_components/billing-client";
import { getSubscriptionPlans } from "@/server/actions/stripe.action";
import { createClient } from "@/utils/supabase/server";

const TRIAL_DAYS = 7;

export default async function BillingPage({
    searchParams,
}: {
    searchParams: Promise<{ reason?: string }>;
}) {
    const { reason } = await searchParams;
    const subscription = await getUserSubscription();
    const plans = await getSubscriptionPlans();

    // Calculate trial days remaining for display
    let trialDaysRemaining = 0;
    if (!subscription.data) {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.created_at) {
            const createdAt = new Date(user.created_at);
            const now = new Date();
            const diffMs = now.getTime() - createdAt.getTime();
            const diffDays = diffMs / (1000 * 60 * 60 * 24);
            trialDaysRemaining = Math.max(0, Math.ceil(TRIAL_DAYS - diffDays));
        }
    }

    return (
        <BillingClient
            reason={reason}
            subscription={subscription.data ?? null}
            plans={plans}
            trialDaysRemaining={trialDaysRemaining}
        />
    );
}
