import { Skeleton } from "@/components/ui/skeleton";

export default function TeamMembersLoading() {
    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 h-[128px] justify-center">
                <Skeleton className="h-8 w-40" />
                <div className="flex justify-between gap-4">
                    <Skeleton className="h-10 w-full max-w-md" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
            <div className="rounded-md border">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b last:border-b-0">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[80px]" />
                        <Skeleton className="h-4 w-[80px]" />
                        <Skeleton className="h-4 w-[40px]" />
                    </div>
                ))}
            </div>
        </div>
    );
}
