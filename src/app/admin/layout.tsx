import { Header } from "@/components/layout/header/header";
import { createClient } from "@/utils/supabase/server";

type AdminLayoutProps = {
    children: React.ReactNode;
}
export default async function AdminLayout(props: AdminLayoutProps) {
    // const supabase = await createClient();

    // const { data } = await supabase.auth.getSession();

    return (
        <div className="grid grid-rows-[64px_1fr]">
            <Header initialSession={null} />
            <div className="container mx-auto px-4">
                {props.children}
            </div>
        </div>
    )
}