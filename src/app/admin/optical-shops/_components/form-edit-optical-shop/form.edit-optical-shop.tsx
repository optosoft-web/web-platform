"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FormEditOpticalShopSchema } from "./form.edit-optical-shop.schemas"
import z from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { LoadingButton } from "@/components/shared/loading-button/loading-button"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ActionUpdateOpticalShop } from "@/server/actions/admin/optical-shop.actions";
import { useQueryClient } from "@tanstack/react-query";
import { iFormEditOpticalShopProps } from "./form.edit-optical-shop.types";

export function FormEditOpticalShop(props: iFormEditOpticalShopProps) {
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof FormEditOpticalShopSchema>>({
        resolver: zodResolver(FormEditOpticalShopSchema),
        defaultValues: {
            id: props.formInitialValue.id,
            name: props.formInitialValue.name,
            address: props.formInitialValue.address
        },
    });

    const { execute, isPending } = useAction(ActionUpdateOpticalShop, {
        onSuccess: async () => {
            toast.success("Edição realizada com sucesso!");
            form.reset();
            await queryClient.invalidateQueries({ queryKey: ['opticalShopsDataForCards'] });
        },
        onError: ({ error }) => {
            if (error.serverError) {
                toast.error(error.serverError)
            }
            if (error.validationErrors) {
                toast.error(error.validationErrors._errors)
                console.log(error.validationErrors);
            }
        }
    });

    async function onSubmit(values: z.infer<typeof FormEditOpticalShopSchema>) {
        try {
            execute(values);
        } catch (error) {
            console.error("Erro no login:", error)
            toast.error(String(error))
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                                <Textarea {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-4">
                    <LoadingButton
                        defaultText="Editar"
                        loadingText="Editando..."
                        isLoading={isPending}
                        type="submit"
                        className="w-full"
                    />
                </div>
            </form>
        </Form>
    )
}