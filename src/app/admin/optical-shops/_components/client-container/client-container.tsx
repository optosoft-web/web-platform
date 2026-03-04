"use client";

import { iClientContainerOpticalShopsProps } from "./client-container.types";
import {
    useQuery,
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
import { CardSkeletonOpticalShop, TableSkeletonOpticalShops } from "../skeletons/optical-shops-skeleton";
import { TableOpticalShops } from "../table-optical-shops/table-optical-shops";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useState } from "react";

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

type ViewMode = "card" | "table";

export function ClientContainerOpticalShops(props: iClientContainerOpticalShopsProps) {
    const [viewMode, setViewMode] = useLocalStorage<ViewMode>("optical-shops-view", "card");
    const [search, setSearch] = useState("");

    const query = useQuery({
        initialData: props.initialOpticalShops,
        queryKey: ['opticalShopsDataForCards'],
        queryFn: fetchOpticalShops
    });

    const filteredData = (query.data ?? []).filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const isLoading = query.isRefetching || query.isLoading;

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
                        <Input
                            className="w-full md:max-w-md"
                            type="search"
                            placeholder="Busque pela ótica..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div>
                        <ToggleGroup
                            value={viewMode}
                            onValueChange={(v) => v && setViewMode(v as ViewMode)}
                            variant="outline"
                            type="single"
                        >
                            <ToggleGroupItem value="card" aria-label="Visualização em cards">
                                <Grid2x2 className="h-4 w-4" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="table" aria-label="Visualização em tabela">
                                <List className="h-4 w-4" />
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </div>
            </div>

            {/* content */}
            {viewMode === "card" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {isLoading ? (
                        Array.from({ length: query.data?.length ?? 3 }).map((_, i) => (
                            <CardSkeletonOpticalShop key={`card-optical-shop-skeleton-${i}`} />
                        ))
                    ) : filteredData.map((item, i) => (
                        <OpticalShopCard
                            key={`optical-shop-card-${item.id}-${i}`}
                            {...item}
                        />
                    ))}
                </div>
            ) : (
                isLoading ? (
                    <TableSkeletonOpticalShops />
                ) : (
                    <TableOpticalShops data={filteredData} />
                )
            )}
        </>
    )
}