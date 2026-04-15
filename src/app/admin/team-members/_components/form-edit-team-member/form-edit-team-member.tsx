"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingButton } from "@/components/shared/loading-button/loading-button";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ActionUpdateTeamMember } from "@/server/actions/admin/team-member.actions";
import type { OpticalShopOption, TeamMemberItem } from "../client-container/client-container.types";

const formSchema = z.object({
    fullName: z.string().min(2, "O nome é obrigatório."),
    email: z.string().email("E-mail inválido."),
    active: z.boolean(),
    opticalShopIds: z.array(z.string().uuid()).min(1, "Selecione ao menos uma ótica."),
});

type FormValues = z.infer<typeof formSchema>;

interface FormEditTeamMemberProps {
    member: TeamMemberItem;
    opticalShops: OpticalShopOption[];
    onSuccess?: () => void;
}

export function FormEditTeamMember({ member, opticalShops, onSuccess }: FormEditTeamMemberProps) {
    const queryClient = useQueryClient();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: member.fullName,
            email: member.email,
            active: member.active,
            opticalShopIds: member.opticalShops.map((s) => s.id),
        },
    });

    const { execute, isPending } = useAction(ActionUpdateTeamMember, {
        onSuccess: async () => {
            toast.success("Usuário atualizado com sucesso!");
            await queryClient.invalidateQueries({ queryKey: ["teamMembersData"] });
            onSuccess?.();
        },
        onError: ({ error }) => {
            if (error.serverError) {
                toast.error(error.serverError);
            }
        },
    });

    function onSubmit(values: FormValues) {
        execute({ id: member.id, ...values });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome completo</FormLabel>
                            <FormControl>
                                <Input type="text" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>E-mail</FormLabel>
                            <FormControl>
                                <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-md border p-3">
                            <div>
                                <FormLabel>Usuário ativo</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                    Desative para bloquear o acesso deste usuário.
                                </p>
                            </div>
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="opticalShopIds"
                    render={() => (
                        <FormItem>
                            <FormLabel>Óticas com acesso</FormLabel>
                            <div className="space-y-2 rounded-md border p-3 max-h-[200px] overflow-y-auto">
                                {opticalShops.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        Nenhuma ótica cadastrada.
                                    </p>
                                ) : (
                                    opticalShops.map((shop) => (
                                        <FormField
                                            key={shop.id}
                                            control={form.control}
                                            name="opticalShopIds"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center gap-2 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(shop.id)}
                                                            onCheckedChange={(checked) => {
                                                                const current = field.value ?? [];
                                                                field.onChange(
                                                                    checked
                                                                        ? [...current, shop.id]
                                                                        : current.filter((id) => id !== shop.id),
                                                                );
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal cursor-pointer">
                                                        {shop.name}
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    ))
                                )}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <LoadingButton
                    defaultText="Salvar Alterações"
                    loadingText="Salvando..."
                    isLoading={isPending}
                    type="submit"
                    className="w-full"
                />
            </form>
        </Form>
    );
}
