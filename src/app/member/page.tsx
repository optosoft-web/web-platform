import { getTeamMembershipForCurrentUser } from "@/server/actions/admin/membership.action";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store } from "lucide-react";

export default async function MemberDashboardPage() {
    const result = await getTeamMembershipForCurrentUser();
    const membership = result?.data;

    if (!membership) {
        redirect("/admin/optical-shops");
    }

    return (
        <div className="py-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Olá, {membership.fullName.split(" ")[0]}!
                </h1>
                <p className="text-muted-foreground">
                    Você está vinculado à conta de <strong>{membership.ownerName}</strong>.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Óticas atribuídas</CardTitle>
                    <CardDescription>
                        Estas são as óticas às quais você tem acesso.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {membership.opticalShops.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Nenhuma ótica atribuída ainda. Entre em contato com o proprietário.
                        </p>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {membership.opticalShops.map((shop) => (
                                <div
                                    key={shop.id}
                                    className="flex items-center gap-3 rounded-lg border p-4"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                                        <Store className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-sm">{shop.name}</p>
                                        <Badge variant="outline" className="mt-1 text-xs">
                                            Ativa
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
