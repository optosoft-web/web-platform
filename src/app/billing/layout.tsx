import { Header } from "@/components/layout/header/header";
import { QueryProvider } from "@/components/shared/query-provider/query-provider";
import { getTeamMembershipForCurrentUser } from "@/server/actions/admin/membership.action";
import { redirect } from "next/navigation";

type BillingLayoutProps = {
    children: React.ReactNode;
};

export default async function BillingLayout({ children }: BillingLayoutProps) {
    // Team members cannot access billing
    const membershipResult = await getTeamMembershipForCurrentUser();
    if (membershipResult?.data) {
        redirect("/member");
    }

    return (
        <div className="grid grid-rows-[64px_1fr]">
            <QueryProvider>
                <Header initialSession={null} />
                <div className="container mx-auto px-4">
                    {children}
                </div>
            </QueryProvider>
        </div>
    );
}
