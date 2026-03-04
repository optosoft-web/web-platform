import { Skeleton } from "@/components/ui/skeleton";

export default function PrescriptionsLoading() {
    return (
        <>
            <div className="flex flex-col gap-4 h-[128px] justify-center">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-10 w-36" />
                </div>
                <div className="flex justify-between gap-4">
                    <Skeleton className="h-10 w-full md:max-w-md" />
                </div>
            </div>

            <div className="rounded-md border">
                <div className="p-3 border-b">
                    <div className="grid grid-cols-7 gap-4">
                        {["w-24", "w-20", "w-16", "w-16", "w-12", "w-20", "w-8"].map((w, i) => (
                            <Skeleton key={i} className={`h-4 ${w}`} />
                        ))}
                    </div>
                </div>
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="p-3 border-b last:border-0">
                        <div className="grid grid-cols-7 gap-4 items-center">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-8 w-8 ml-auto" />
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
