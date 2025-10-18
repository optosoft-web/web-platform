'use client';

import { Input } from "@/components/ui/input";
import { iClientContainerOpticalShopProps } from "./client-container.types";
import { Button, buttonVariants } from "@/components/ui/button";
import { EllipsisVertical, Plus } from "lucide-react";
import { TablePatient } from "../table-patient/table.patient";
import { getCoreRowModel, getPaginationRowModel, getSortedRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table";
import { tablePatientColumns } from "../table-patient/table.patient-columns";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { usePatients } from "@/hooks/use-patient";
import { useIsMobile } from "@/hooks/use-mobile";
import { PatientCardList } from "../list-card-patient/list.card-patient";
import { DialogCreatePatient } from "../dialog-create-patient/dialog.create-patient";

export function ClientContainerOpticalShop(props: iClientContainerOpticalShopProps) {
    const isMobile = useIsMobile();
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 300);

    const [sorting, setSorting] = useState<SortingState>([]);

    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const { data, isLoading, isError } = usePatients({
        query: debouncedQuery,
        limit: pageSize,
        offset: pageIndex * pageSize,
        sortColumn: sorting[0]?.id,
        sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
    });

    const defaultData = { data: [], totalCount: 0 };
    const { data: patients = [], totalCount = 0 } = data ?? defaultData;

    const pageCount = Math.ceil(totalCount / pageSize);

    const table = useReactTable({
        data: patients,
        columns: tablePatientColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        manualSorting: true,
        pageCount,
        state: {
            sorting,
            pagination: { pageIndex, pageSize },
        },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
    });

    return (
        <>
            {/* page header */}
            <div className="flex flex-col gap-4 h-[128px] justify-center">
                <div className="flex justify-between items-center">
                    <div className="text-xl uppercase font-bold truncate">{props.opticalShopData.name}</div>
                    <div className="flex gap-4">
                        <Button>
                            <Plus />
                            <span>
                                <span className="hidden md:inline">Criar</span> Receita
                            </span>
                        </Button>
                        <DialogCreatePatient>
                            <Button variant={'outline'}>
                                <Plus />
                                <span>
                                    <span className="hidden md:inline">Adicionar</span> Paciente
                                </span>
                            </Button>
                        </DialogCreatePatient>

                        <Button variant={'ghost'}>
                            <EllipsisVertical />
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between gap-4">
                    <div className="w-full">
                        <Input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full md:max-w-md" type="search" placeholder="Busque pelo paciente..." />
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
            {/* content */}
            <div className="w-full">
                {isMobile ? <PatientCardList patients={patients} isLoading={isLoading} /> : <TablePatient table={table} isLoading={isLoading} />}

                <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-muted-foreground">
                        Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                    </span>
                    <div className="space-x-2">
                        <Button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Anterior
                        </Button>
                        <Button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Próxima
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}