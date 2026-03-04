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
import { ActionCreateTeamMember } from "@/server/actions/admin/team-member.actions";
import type { OpticalShopOption } from "../client-container/client-container.types";

const formSchema = z.object({
    fullName: z.string().min(2, "O nome é obrigatório."),
    email: z.string().email("E-mail inválido."),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
    opticalShopIds: z.array(z.string().uuid()).min(1, "Selecione ao menos uma ótica."),
});

type FormValues = z.infer<typeof formSchema>;

interface FormCreateTeamMemberProps {
    opticalShops: OpticalShopOption[];
    onSuccess?: () => void;
}

export function FormCreateTeamMember({ opticalShops, onSuccess }: FormCreateTeamMemberProps) {
    const queryClient = useQueryClient();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            opticalShopIds: [],
        },
    });

    const { execute, isPending } = useAction(ActionCreateTeamMember, {
        onSuccess: async () => {
            toast.success("Usuário criado com sucesso!");
            form.reset();
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
        execute(values);
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
                                <Input type="text" placeholder="João da Silva" {...field} />
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
                                <Input type="email" placeholder="joao@exemplo.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Senha</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Mínimo 8 caracteres" {...field} />
                            </FormControl>
                            <FormMessage />
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
                    defaultText="Criar Usuário"
                    loadingText="Criando..."
                    isLoading={isPending}
                    type="submit"
                    className="w-full"
                />
            </form>
        </Form>
    );
}
