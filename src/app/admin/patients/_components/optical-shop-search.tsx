"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { searchOpticalShops } from "@/server/actions/admin/optical-shop.actions";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface OpticalShop {
  id: string;
  name: string;
}

interface OpticalShopSearchProps {
  onShopSelect: (shopId: string) => void;
}

export function OpticalShopSearch({ onShopSelect }: OpticalShopSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selectedShopName, setSelectedShopName] = React.useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { data: foundShops, isLoading } = useQuery({
    queryKey: ['opticalShopSearch', debouncedQuery],
    queryFn: async () => {
      const result = await searchOpticalShops({ query: debouncedQuery });
      if (result.serverError || !result.data) {
        throw new Error(result.serverError || "Erro ao buscar óticas.");
      }
      return result.data;
    },
    enabled: debouncedQuery.length > 1 && query !== selectedShopName,
  });

  const handleSelect = (shop: OpticalShop) => {
    onShopSelect(shop.id);
    setQuery(shop.name);
    setSelectedShopName(shop.name);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between">
          {selectedShopName || "Selecione uma ótica..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Buscar ótica..." value={query} onValueChange={setQuery} />
          <CommandList>
            {isLoading && <div className="p-2 text-sm">Buscando...</div>}
            {!isLoading && !foundShops?.length && debouncedQuery.length > 1 && (
              <CommandEmpty>Nenhuma ótica encontrada.</CommandEmpty>
            )}
            <CommandGroup>
              {foundShops?.map((shop) => (
                <CommandItem key={shop.id} value={shop.name} onSelect={() => handleSelect(shop)}>
                  <Check className={cn("mr-2 h-4 w-4", selectedShopName === shop.name ? "opacity-100" : "opacity-0")} />
                  {shop.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}