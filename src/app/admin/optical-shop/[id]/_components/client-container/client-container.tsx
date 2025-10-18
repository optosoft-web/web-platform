import { Input } from "@/components/ui/input";
import { iClientContainerOpticalShopProps } from "./client-container.types";
import { Button } from "@/components/ui/button";
import { EllipsisVertical, Plus } from "lucide-react";

export function ClientContainerOpticalShop(props: iClientContainerOpticalShopProps) {
    return (
        <>
            {/* page header */}
            <div className="flex flex-col gap-4 h-[128px] justify-center">
                <div className="flex justify-between items-center">
                    <div className="text-xl uppercase font-bold">{props.opticalShopData.name}</div>
                    <div className="flex gap-4">
                        <Button>
                            <Plus />
                            Criar Receita
                        </Button>
                        <Button variant={'outline'}>
                            <Plus />
                            Adicionar Paciente
                        </Button>
                        <Button variant={'ghost'}>
                            <EllipsisVertical />
                        </Button>
                        {/* <DialogCreateOpticalShop /> */}
                    </div>
                </div>
                <div className="flex justify-between gap-4">
                    <div className="w-full">
                        <Input className="w-full md:max-w-md" type="search" placeholder="Busque pelo paciente..." />
                    </div>
                    <div>
                        {/* <ToggleGroup defaultValue="card" variant="outline" type="single">
                            <ToggleGroupItem value="card" aria-label="Toggle card view">
                                <Grid2x2 className="h-4 w-4" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="table" aria-label="Toggle table view">
                                <List className="h-4 w-4" />
                            </ToggleGroupItem>
                        </ToggleGroup> */}
                    </div>
                </div>
            </div>
        </>
    )
}