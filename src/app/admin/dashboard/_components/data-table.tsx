"use client"

import * as React from "react"
import {
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconCircleCheckFilled,
    IconDotsVertical,
    IconFileText,
    IconLoader,
    IconPlus,
    IconTableOptions,
} from "@tabler/icons-react"
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

// 1. Schema adaptado para Pacientes
export const pacienteSchema = z.object({
    id: z.string(),
    nome: z.string(),
    dataNascimento: z.string(),
    ultimaConsulta: z.string(),
    status: z.enum(["Ativo", "Inativo", "Aguardando Retorno"]),
    contato: z.string(),
})

type Paciente = z.infer<typeof pacienteSchema>

// 2. Definição das colunas da tabela
const columns: ColumnDef<Paciente>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Selecionar todos"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Selecionar linha"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "nome",
        header: "Paciente",
        cell: ({ row }) => {
            // Este componente abre o Drawer com detalhes
            return <VisualizadorDetalhesPaciente paciente={row.original} />
        },
        enableHiding: false,
    },
    {
        accessorKey: "dataNascimento",
        header: "Data de Nascimento",
    },
    {
        accessorKey: "ultimaConsulta",
        header: "Última Consulta",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            const variant = {
                "Ativo": "outline-green",
                "Aguardando Retorno": "outline-yellow",
                "Inativo": "outline",
            }[status] ?? "outline"

            return (
                <Badge variant={variant as any} className="px-2 py-0.5">
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "contato",
        header: "Contato",
    },
    {
        id: "actions",
        cell: () => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="data-[state=open]:bg-muted text-muted-foreground flex size-8 p-0"
                    >
                        <IconDotsVertical className="size-4" />
                        <span className="sr-only">Abrir menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem>
                        <IconFileText className="mr-2 size-4" />
                        Ver Receitas
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Editar</DropdownMenuItem>
                    <DropdownMenuItem>Agendar Retorno</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">Excluir</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
]

// 3. Tabela Principal (Componente completo)
export function TabelaDePacientes({ data: initialData }: { data: Paciente[] }) {
    const [data, setData] = React.useState(() => initialData)
    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    })

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        getRowId: (row) => row.id,
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    return (
        <div className="w-full flex-col justify-start gap-4 space-y-4">
            <div className="flex items-center justify-between px-1">
                <Input
                    placeholder="Filtrar pacientes por nome..."
                    value={(table.getColumn("nome")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("nome")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <IconTableOptions className="mr-2 size-4" />
                                <span className="hidden lg:inline">Personalizar Colunas</span>
                                <span className="lg:hidden">Colunas</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter(
                                    (column) =>
                                        typeof column.accessorFn !== "undefined" &&
                                        column.getCanHide()
                                )
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id === 'dataNascimento' ? 'Data de Nascimento' : column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size="sm">
                        <IconPlus className="mr-2 size-4" />
                        Adicionar Paciente
                    </Button>
                </div>
            </div>
            <div className="overflow-hidden rounded-lg border">
                <Table>
                    <TableHeader className="bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} colSpan={header.colSpan}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Nenhum paciente encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between px-2">
                <div className="text-muted-foreground flex-1 text-sm">
                    {table.getFilteredSelectedRowModel().rows.length} de{" "}
                    {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
                </div>
                <div className="flex w-full items-center gap-6 lg:w-fit lg:gap-8">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="rows-per-page" className="text-sm font-medium">
                            Linhas por página
                        </Label>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-fit items-center justify-center text-sm font-medium">
                        Página {table.getState().pagination.pageIndex + 1} de{" "}
                        {table.getPageCount()}
                    </div>
                    <div className="ml-auto flex items-center gap-2 lg:ml-0">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Ir para a primeira página</span>
                            <IconChevronsLeft className="size-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8 p-0"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Página anterior</span>
                            <IconChevronLeft className="size-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8 p-0"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Próxima página</span>
                            <IconChevronRight className="size-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden size-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Ir para a última página</span>
                            <IconChevronsRight className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}


// 4. Drawer de Detalhes do Paciente
function VisualizadorDetalhesPaciente({ paciente }: { paciente: Paciente }) {
    // Idealmente, você usaria um hook para detectar se é mobile ou não
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    return (
        <Drawer direction={isMobile ? "bottom" : "right"}>
            <DrawerTrigger asChild>
                <Button variant="link" className="text-foreground h-auto p-0 text-left font-medium">
                    {paciente.nome}
                </Button>
            </DrawerTrigger>
            <DrawerContent className="h-full max-w-2xl">
                <DrawerHeader className="gap-1">
                    <DrawerTitle>Detalhes do Paciente</DrawerTitle>
                    <DrawerDescription>{paciente.nome}</DrawerDescription>
                </DrawerHeader>
                <form className="flex flex-col gap-4 overflow-y-auto px-4 text-sm" onSubmit={(e) => {
                    e.preventDefault();
                    toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
                        loading: `Salvando dados de ${paciente.nome}...`,
                        success: "Dados salvos com sucesso!",
                        error: "Erro ao salvar.",
                    });
                }}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="nome">Nome Completo</Label>
                            <Input id="nome" defaultValue={paciente.nome} />
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                            <Input id="dataNascimento" type="date" defaultValue={paciente.dataNascimento} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="contato">Telefone / Contato</Label>
                            <Input id="contato" defaultValue={paciente.contato} />
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="status">Status</Label>
                            <Select defaultValue={paciente.status}>
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Selecione um status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Ativo">Ativo</SelectItem>
                                    <SelectItem value="Aguardando Retorno">Aguardando Retorno</SelectItem>
                                    <SelectItem value="Inativo">Inativo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {/* Adicione outros campos aqui conforme necessário */}
                </form>
                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button variant="outline">Fechar</Button>
                    </DrawerClose>
                    <Button onClick={() => {
                        toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
                            loading: `Salvando dados de ${paciente.nome}...`,
                            success: "Dados salvos com sucesso!",
                            error: "Erro ao salvar.",
                        });
                    }}>Salvar Alterações</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}