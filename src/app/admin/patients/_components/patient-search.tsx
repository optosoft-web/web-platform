"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { searchPatients } from "@/server/actions/admin/patient.actions";
import { useDebounce } from "@/hooks/use-debounce";
import { useQuery } from "@tanstack/react-query";

interface Patient {
  id: string;
  fullName: string;
}

interface PatientSearchProps {
  selectedPatient: Patient | null;
  onPatientSelect: (patient: Patient | null) => void;
  onNewPatientRequest: (name: string) => void;
}

export function PatientSearch({ selectedPatient, onPatientSelect, onNewPatientRequest }: PatientSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebounce(query, 300);


  const handleSelect = (patient: Patient) => {
    onPatientSelect(patient);
    setQuery(patient.fullName);
    setOpen(false);
  };

  const handleCreateNew = () => {
    onNewPatientRequest(query);
    setOpen(false);
  }

  const { data: foundPatients, isLoading } = useQuery({
    queryKey: ['patientSearch', debouncedQuery],
    queryFn: async () => {
      const result = await searchPatients({ query: debouncedQuery });
      if (result.serverError || !result.data) {
        throw new Error(result.serverError || "Erro ao buscar pacientes.");
      }
      return result.data;
    },
    enabled: debouncedQuery.length > 1,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedPatient ? selectedPatient.fullName : "Digite o nome do paciente..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder="Buscar paciente..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {isLoading && (
              <div className="p-4 text-sm flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Buscando...
              </div>
            )}
            {!isLoading && !foundPatients?.length && debouncedQuery.length > 1 && (
              <CommandEmpty className="pt-1 flex flex-col items-center justify-center">
                <small>Nenhum paciente encontrado.</small>
                <Button variant="ghost" className="mt-2 h-auto py-1" onClick={handleCreateNew}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Cadastrar novo paciente: <br /> &quot;{query}&quot;
                </Button>
              </CommandEmpty>
            )}
            <CommandGroup>
              {foundPatients?.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={patient.fullName}
                  onSelect={() => handleSelect(patient)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedPatient?.id === patient.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {patient.fullName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}