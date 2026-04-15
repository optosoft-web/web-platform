import { Skeleton } from "@/components/ui/skeleton";

export default function MemberLoading() {
    return (
        <div className="py-8 space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-72" />
            </div>

            <div className="rounded-lg border">
                <div className="p-6 space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="px-6 pb-6">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-20 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
