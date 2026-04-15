"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod"
import {
    Form
} from "@/components/ui/form"
import { LoadingButton } from "@/components/shared/loading-button/loading-button"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { ActionDeleteOpticalShop } from "@/server/actions/admin/optical-shop.actions";
import { useQueryClient } from "@tanstack/react-query";
import { FormDeleteOpticalShopSchema } from "./form.delete-optical-shop.schemas";
import { iFormDeleteOpticalShopProps } from "./form.delete-optical-shop.types";

export function FormDeleteOpticalShop(props: iFormDeleteOpticalShopProps) {
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof FormDeleteOpticalShopSchema>>({
        resolver: zodResolver(FormDeleteOpticalShopSchema),
        defaultValues: {
            id: props.formInitialValue.id,
        },
    });

    const { execute, isPending } = useAction(ActionDeleteOpticalShop, {
        onSuccess: async () => {
            toast.success("Deleção realizada com sucesso!");
            form.reset();
            await queryClient.invalidateQueries({ queryKey: ['opticalShopsDataForCards'] });
            props.onSuccess?.();
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

    async function onSubmit() {
        try {
            execute(form.getValues());
        } catch (error) {
            console.error("Erro no login:", error)
            toast.error(String(error))
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <LoadingButton
                        defaultText="Excluir"
                        loadingText="Excluindo..."
                        isLoading={isPending}
                        type="submit"
                        className="w-full"
                        variant={'destructive'}
                    />
                </div>
            </form>
        </Form>
    )
}