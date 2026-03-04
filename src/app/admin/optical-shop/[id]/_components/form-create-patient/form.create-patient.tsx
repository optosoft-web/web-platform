"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
    createPatientFormSchema,
    type CreatePatientFormValues,
} from "./form.create-patient.schemas";
import { iFormCreatePatientProps } from "./form.create-patient.types";
import { createPatient } from "@/server/actions/admin/patient.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/shared/loading-button/loading-button";

export function FormCreatePatient({ opticalShopId, onSuccess }: iFormCreatePatientProps) {
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreatePatientFormValues>({
        resolver: zodResolver(createPatientFormSchema),
        defaultValues: {
            fullName: "",
            phone: "",
            cpf: "",
            rg: "",
            dateOfBirth: "",
            contactInfo: "",
        },
    });

    const action = useAction(createPatient, {
        onSuccess: () => {
            toast.success("Paciente cadastrado com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["patients"] });
            reset();
            onSuccess?.();
        },
        onError: ({ error }) => {
            toast.error(error.serverError || "Erro ao cadastrar paciente.");
        },
    });

    function onSubmit(values: CreatePatientFormValues) {
        action.execute({
            fullName: values.fullName,
            dateOfBirth: values.dateOfBirth || undefined,
            contactInfo: values.phone || values.contactInfo || undefined,
            opticalShopId,
        });
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="space-y-1.5">
                <Label htmlFor="fullName">Nome completo *</Label>
                <Input
                    id="fullName"
                    placeholder="Nome do paciente"
                    {...register("fullName")}
                />
                {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName.message}</p>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                        id="phone"
                        placeholder="(99) 99999-9999"
                        {...register("phone")}
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                        id="cpf"
                        placeholder="000.000.000-00"
                        {...register("cpf")}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="rg">RG</Label>
                    <Input
                        id="rg"
                        placeholder="00.000.000-0"
                        {...register("rg")}
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
                    <Input
                        id="dateOfBirth"
                        type="date"
                        {...register("dateOfBirth")}
                    />
                </div>
            </div>

            <div className="pt-2">
                <LoadingButton
                    type="submit"
                    className="w-full"
                    isLoading={action.isPending}
                    defaultText="Cadastrar Paciente"
                    loadingText="Cadastrando..."
                />
            </div>
        </form>
    );
}
