import { Skeleton } from "@/components/ui/skeleton";

export default function MemberPrescriptionsLoading() {
    return (
        <div className="py-8 space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-full max-w-md" />
            <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        </div>
    );
}
