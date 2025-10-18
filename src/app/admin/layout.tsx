import { Header } from "@/components/layout/header/header";
import { QueryProvider } from "@/components/shared/query-provider/query-provider";
import { getUserSubscription } from "@/server/actions/admin/subscription.action";

type AdminLayoutProps = {
    children: React.ReactNode;
}
export default async function AdminLayout(props: AdminLayoutProps) {
    // const supabase = await createClient();

    // const { data } = await supabase.auth.getSession();

    const subscription = await getUserSubscription();

    const invalidStatus = [
        "canceled",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "unpaid",
    ];

    const currentStatus = subscription.data?.status;

    if (currentStatus && invalidStatus.indexOf(currentStatus) !== -1) {
        console.log("A assinatura tem um status inválido:", currentStatus);
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