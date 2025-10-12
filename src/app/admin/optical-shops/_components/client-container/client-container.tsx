"use client";

import { iClientContainerOpticalShopsProps, iQueryContainerProps } from "./client-container.types";
import {
    useQuery,
    useQueryClient,
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import { Input } from "@/components/ui/input";
import { Grid2x2, List } from "lucide-react";
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { DialogCreateOpticalShop } from "../dialog-create-optical-shop/dialog.create-optical-shop";
import { OpticalShopCard } from "../card-optical-shop/card-optical-shop";
import { iOpticalShopCardProps } from "../card-optical-shop/card-optical-shop.types";
import { ActionGetOpticalShopsForCards } from "@/server/actions/admin/optical-shop.actions";
import { CardSkeletonOpticalShop } from "../skeletons/optical-shops-skeleton";

const fetchOpticalShops = async (): Promise<iOpticalShopCardProps[]> => {
    const result = await ActionGetOpticalShopsForCards();

    if (result.serverError || result.validationErrors) {
        throw new Error(result.serverError || "Ocorreu um erro de validação.");
    }

    if (!result.data) {
        throw new Error("A ação não retornou dados ou um erro esperado.");
    }

    return result.data;
};

export function ClientContainerOpticalShops(props: iClientContainerOpticalShopsProps) {
    const query = useQuery({
        initialData: props.initialOpticalShops,
        queryKey: ['opticalShopsDataForCards'],
        queryFn: fetchOpticalShops
    });

    return (
        <>
            {/* page header */}
            <div className="flex flex-col gap-4 h-[128px] justify-center">
                <div className="flex justify-between items-center">
                    <div className="text-xl uppercase font-bold">Óticas</div>
                    <div>
                        <DialogCreateOpticalShop />
                    </div>
                </div>
                <div className="flex justify-between gap-4">
                    <div className="w-full">
                        <Input className="w-full md:max-w-md" type="search" placeholder="Busque pela ótica..." />
                    </div>
                    <div>
                        <ToggleGroup defaultValue="card" variant="outline" type="single">
                            <ToggleGroupItem value="card" aria-label="Toggle card view">
                                <Grid2x2 className="h-4 w-4" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="table" aria-label="Toggle table view">
                                <List className="h-4 w-4" />
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </div>
            </div>
            {/* cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {(query.isRefetching || query.isLoading) ? (
                    Array.from({ length: query.data?.length ?? 3 }).map((_, i) => (
                        <CardSkeletonOpticalShop key={`card-optical-shop-skeleton-${i}`} />
                    ))
                ) : query.data?.map((item, i) => (
                    <OpticalShopCard
                        key={`optical-shop-card-${item.id}-${i}`}
                        {...item}
                    />
                ))}
            </div>
        </>
    )
}