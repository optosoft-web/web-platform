"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { createPatient } from "@/server/actions/admin/patient.actions";


// Componentes ShadCN
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { OpticalShopSearch } from "../optical-shop-search";
import { OpticalShopSelect } from "../optical-shop-select";

// Schema de validação do formulário
const createPatientFormSchema = z.object({
  fullName: z.string().min(3, { message: "Nome completo é obrigatório." }),
  dateOfBirth: z.string().optional(),
  contactInfo: z.string().optional(),
  opticalShopId: z.string().uuid({ message: "Selecione uma ótica." }),
});

type CreatePatientFormValues = z.infer<typeof createPatientFormSchema>;

interface CreatePatientFormProps {
  initialName?: string; 
  onPatientCreated: (patient: { id: string, fullName: string }) => void; 
}

export function CreatePatientForm({ initialName = "", onPatientCreated }: CreatePatientFormProps) {
  const form = useForm<CreatePatientFormValues>({
    resolver: zodResolver(createPatientFormSchema),
    defaultValues: {
      fullName: initialName,
      dateOfBirth: "",
      contactInfo: "",
      opticalShopId: "",
    },
  });

  const { execute, status } = useAction(createPatient, {
    onSuccess: (data) => {
      toast.success(`Paciente "${data.data.fullName}" criado com sucesso!`);
      onPatientCreated(data.data); 
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Falha ao criar paciente.");
    },
  });

  function onSubmit(values: CreatePatientFormValues) {
    execute(values);
  }

  const isSubmitting = status === "executing";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Nome do paciente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="opticalShopId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ótica de Origem</FormLabel>
              <FormControl>
                 <OpticalShopSelect 
                    value={field.value}
                    onShopSelect={(shopId) => {
                      field.onChange(shopId);
                    }}
                 />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Nascimento (Opcional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contato (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Telefone, e-mail, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Paciente
        </Button>
      </form>
    </Form>
  );
}