"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { ActionGetOpticalShops } from "@/server/actions/admin/optical-shop.actions";
import { useLocalStorage } from "@/hooks/use-local-storage";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OpticalShop {
  id: string;
  name: string;
}

interface OpticalShopSelectProps {
  value: string;
  onShopSelect: (shopId: string) => void;
}

const LAST_SHOP_KEY = "lastSelectedOpticalShop";

export function OpticalShopSelect({ value, onShopSelect }: OpticalShopSelectProps) {
  const [lastSelectedShop, setLastSelectedShop] = useLocalStorage<OpticalShop | null>(LAST_SHOP_KEY, null);

  const { data: allShops, isLoading, isError } = useQuery({
    queryKey: ['allOpticalShops'], // Chave de cache para esta query
    queryFn: async () => {
      const result = await ActionGetOpticalShops();
      if (result.serverError || !result.data) {
        toast.error("Não foi possível carregar as óticas.");
        throw new Error(result.serverError || "Erro ao buscar óticas.");
      }
      return result.data;
    },
  });

  React.useEffect(() => {
    if (allShops && lastSelectedShop && !value) {
        const savedShopExists = allShops.some(shop => shop.id === lastSelectedShop.id);
        if (savedShopExists) {
            onShopSelect(lastSelectedShop.id);
        }
    }
  }, [allShops, lastSelectedShop, onShopSelect, value]);


  const handleSelectionChange = (shopId: string) => {
    onShopSelect(shopId);
    const selectedShop = allShops?.find(shop => shop.id === shopId);
    if (selectedShop) {
      setLastSelectedShop(selectedShop);
    }
  };
  
  if (isError) {
    return <p className="text-sm text-destructive">Erro ao carregar óticas.</p>
  }

  return (
    <Select
      value={value}
      onValueChange={handleSelectionChange}
      disabled={isLoading || !allShops}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isLoading ? "Carregando óticas..." : "Selecione uma ótica"} />
      </SelectTrigger>
      <SelectContent>
        {allShops?.map((shop) => (
          <SelectItem key={shop.id} value={shop.id}>
            {shop.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}