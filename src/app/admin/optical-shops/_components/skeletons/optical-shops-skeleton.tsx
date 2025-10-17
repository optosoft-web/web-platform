
import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeletonOpticalShop() {
    return (
        <Skeleton className="h-[251px] w-full rounded-xl" />
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