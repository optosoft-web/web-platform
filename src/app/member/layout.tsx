import { QueryProvider } from "@/components/shared/query-provider/query-provider";
import { MemberHeader } from "./_components/member-header";
import { getTeamMembershipForCurrentUser } from "@/server/actions/admin/membership.action";
import { redirect } from "next/navigation";

type MemberLayoutProps = {
    children: React.ReactNode;
};

export default async function MemberLayout({ children }: MemberLayoutProps) {
    const result = await getTeamMembershipForCurrentUser();
    const membership = result?.data;

    // If the user is not a team member, send them to the owner admin area
    if (!membership) {
        redirect("/admin/optical-shops");
    }

    // If the team member is blocked, sign them out
    if (!membership.active) {
        redirect("/auth/sign-in?reason=blocked");
    }

    return (
        <div className="grid grid-rows-[64px_1fr]">
            <QueryProvider>
                <MemberHeader
                    ownerName={membership.ownerName}
                    memberName={membership.fullName}
                    memberEmail={membership.email}
                />
                <div className="container mx-auto px-4">
                    {children}
                </div>
            </QueryProvider>
        </div>
    );
}
