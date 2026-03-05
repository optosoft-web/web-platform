"use client";

import { useState, useMemo, useCallback } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface DegreeComboboxProps {
    options: string[];
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    /** Display suffix for each option (e.g., "°" for axis) */
    suffix?: string;
    id?: string;
    className?: string;
}

export function DegreeCombobox({
    options,
    value,
    onValueChange,
    placeholder = "Selecionar...",
    searchPlaceholder = "Buscar...",
    emptyMessage = "Nenhuma opção encontrada.",
    suffix = "",
    id,
    className,
}: DegreeComboboxProps) {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        if (!search) return options;
        const q = search.replace(",", ".").toLowerCase().trim();
        return options.filter((opt) => opt.toLowerCase().includes(q));
    }, [options, search]);

    const handleSelect = useCallback(
        (selectedValue: string) => {
            onValueChange(selectedValue === value ? "" : selectedValue);
            setOpen(false);
            setSearch("");
        },
        [onValueChange, value]
    );

    const displayValue = value
        ? `${value}${suffix}`
        : placeholder;

    // On mobile, sort options descending so positive values are above 0 and negatives below
    const mobileOptions = useMemo(() => {
        return [...options].sort((a, b) => {
            const numA = parseFloat(a.replace(",", "."));
            const numB = parseFloat(b.replace(",", "."));
            if (isNaN(numA) || isNaN(numB)) return 0;
            return numB - numA; // descending: +20 ... +0.25, 0, -0.25 ... -20
        });
    }, [options]);

    // On mobile, render a native <select> for better scroll UX
    if (isMobile) {
        return (
            <select
                id={id}
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                className={cn(
                    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    !value && "text-muted-foreground",
                    className
                )}
            >
                <option value="">{placeholder}</option>
                {mobileOptions.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}{suffix}
                    </option>
                ))}
            </select>
        );
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <span className="truncate">{displayValue}</span>
                    <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup>
                            {filtered.map((opt) => (
                                <CommandItem
                                    key={opt}
                                    value={opt}
                                    onSelect={() => handleSelect(opt)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-1 h-3.5 w-3.5",
                                            value === opt ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {opt}{suffix}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
