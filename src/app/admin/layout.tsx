import { Header } from "@/components/layout/header/header";
import { QueryProvider } from "@/components/shared/query-provider/query-provider";
import { getUserSubscription } from "@/server/actions/admin/subscription.action";
import { getTeamMembershipForCurrentUser } from "@/server/actions/admin/membership.action";
import { redirect } from "next/navigation";

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

    // No subscription at all — user hasn't subscribed yet
    if (!subscription.data) {
        redirect("/billing?reason=no_subscription");
    }

    const invalidStatuses = [
        "canceled",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "unpaid",
    ];

    // Subscription exists but has a bad status
    if (currentStatus && invalidStatuses.includes(currentStatus)) {
        redirect(`/billing?reason=${currentStatus}`);
    }

    return (
        <div className="grid grid-rows-[64px_1fr]">
            <QueryProvider>
                <Header initialSession={null} />
                <div className="container mx-auto px-4">
                    {props.children}
                </div>
            </QueryProvider>
        </div>
    )
}