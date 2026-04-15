
import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeletonOpticalShop() {
    return (
        <Skeleton className="h-[251px] w-full rounded-xl" />
    );
}

export function TableSkeletonOpticalShops() {
    return (
        <div className="rounded-md border">
            <div className="p-3 border-b">
                <div className="grid grid-cols-5 gap-4">
                    {["w-24", "w-32", "w-20", "w-24", "w-16"].map((w, i) => (
                        <Skeleton key={i} className={`h-4 ${w}`} />
                    ))}
                </div>
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-3 border-b last:border-0">
                    <div className="grid grid-cols-5 gap-4 items-center">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-10" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-8 ml-auto" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function OpticalShopsPageSkeleton() {
    return (
        <>
            {/* Skeleton do Header */}
            <div className="flex flex-col gap-4 h-[128px] justify-center">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="flex justify-between gap-4">
                    <Skeleton className="h-10 w-full md:max-w-md" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>

            {/* Skeleton do Grid de Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <CardSkeletonOpticalShop key={`card-skeleton-optical-shops-${i}`} />
                ))}
            </div>
        </>
    );
}