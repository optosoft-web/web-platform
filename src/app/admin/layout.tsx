import { Header } from "@/components/layout/header/header";
import { QueryProvider } from "@/components/shared/query-provider/query-provider";
import { getUserSubscription } from "@/server/actions/admin/subscription.action";
import { getTeamMembershipForCurrentUser } from "@/server/actions/admin/membership.action";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { TrialBanner } from "@/components/shared/trial-banner/trial-banner";

const TRIAL_DAYS = 7;

type AdminLayoutProps = {
    children: React.ReactNode;
}
export default async function AdminLayout(props: AdminLayoutProps) {
    // If the user is a team member, redirect them to the member area
    const membershipResult = await getTeamMembershipForCurrentUser();
    if (membershipResult?.data) {
        redirect("/member");
    }

    const subscription = await getUserSubscription();
    const currentStatus = subscription.data?.status;

    // Check if user is within the free trial period (no subscription needed)
    let trialDaysRemaining = 0;
    let isInTrial = false;

    if (!subscription.data || (currentStatus && ["canceled", "incomplete", "incomplete_expired", "past_due", "unpaid"].includes(currentStatus))) {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user?.created_at) {
            const createdAt = new Date(user.created_at);
            const now = new Date();
            const diffMs = now.getTime() - createdAt.getTime();
            const diffDays = diffMs / (1000 * 60 * 60 * 24);
            trialDaysRemaining = Math.max(0, Math.ceil(TRIAL_DAYS - diffDays));
            isInTrial = trialDaysRemaining > 0;
        }

        if (!isInTrial) {
            // Trial expired and no valid subscription
            if (!subscription.data) {
                redirect("/billing?reason=trial_expired");
            }
            if (currentStatus) {
                redirect(`/billing?reason=${currentStatus}`);
            }
        }
    }

    // Has valid subscription (active or trialing via Stripe)
    const hasValidSubscription = subscription.data && !["canceled", "incomplete", "incomplete_expired", "past_due", "unpaid"].includes(currentStatus ?? "");

    return (
        <div className="grid grid-rows-[64px_1fr]">
            <QueryProvider>
                <Header initialSession={null} />
                {isInTrial && !hasValidSubscription && (
                    <TrialBanner daysRemaining={trialDaysRemaining} />
                )}
                <div className="container mx-auto px-4">
                    {props.children}
                </div>
            </QueryProvider>
        </div>
    )
}