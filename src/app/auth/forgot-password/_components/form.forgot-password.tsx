"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { ActionForgotPassword } from "../actions"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { LoadingButton } from "@/components/shared/loading-button/loading-button"

const schemaForgotPasswordInput = z.object({
    email: z.email().min(1, "O e-mail é obrigatório."),
});

export function FormForgotPassword({
    className,
    ...props
}: React.ComponentProps<"div">) {

    const form = useForm<z.infer<typeof schemaForgotPasswordInput>>({
        resolver: zodResolver(schemaForgotPasswordInput),
        defaultValues: {
            email: "",
        },
    })

    const { execute, isPending } = useAction(ActionForgotPassword, {
        onSuccess: (data) => {
            toast.success("Link enviado! Verifique seu e-mail.")
        },
        onError: ({ error }) => {
            if (error.serverError) {
                toast.error(error.serverError)
            }
            if (error.validationErrors) {
                toast.error('Erro de validação do formulário.')
                console.log(error.validationErrors);
            }
        }
    })

    async function onSubmit(values: z.infer<typeof schemaForgotPasswordInput>) {
        try {
            execute(values);
        } catch (error) {
            // console.error("Erro no login:", error)
            toast.error(String(error))
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Recuperar senha</CardTitle>
                    <CardDescription>Prencha o campo de e-mail para receber o link de recuperação</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>E-mail</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="space-y-4">
                                <LoadingButton
                                    defaultText="Enviar"
                                    loadingText="Enviando..."
                                    isLoading={isPending}
                                    type="submit"
                                    className="w-full"
                                />
                                <FormDescription className="text-center">
                                    Possui uma conta?{" "}
                                    <Link href="/auth/sign-in" className="underline-offset-4 hover:underline" aria-disabled={isPending}>
                                        Entre por aqui
                                    </Link>
                                </FormDescription>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}