"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"
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
import { ActionResetPassword } from "../actions"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { LoadingButton } from "@/components/shared/loading-button/loading-button"
import { useSearchParams } from "next/navigation"

const schemaResetPasswordInput = z.object({
    password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
    confirmedPassWord: z.string().min(8, "A senha deve ter no mínimo 8 caracteres.")
}).refine((data) => data.password === data.confirmedPassWord, {
    message: "As senhas não são iguais.",
    path: ["confirmedPassWord"],
});

export function FormResetPassword({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const searchParams = useSearchParams();
    const code = searchParams.get('code') as string;

    const form = useForm<z.infer<typeof schemaResetPasswordInput>>({
        resolver: zodResolver(schemaResetPasswordInput),
        defaultValues: {
            password: "",
            confirmedPassWord: "",
        },
    })

    const { execute, isPending } = useAction(ActionResetPassword, {
        onSuccess: () => {
            toast.success("Senha alterada.")
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

    if (!code) {
        return <p>Link de redefinição de senha inválido ou expirado.</p>;
    }

    async function onSubmit(values: z.infer<typeof schemaResetPasswordInput>) {
        try {
            execute({
                ...values,
                code: code
            });
        } catch (error) {
            console.log({ error })
            toast.error(String(error))
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Alterar senha</CardTitle>
                    <CardDescription>Prencha os campos abaixo para alterar sua senha</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Senha</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmedPassWord"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirmar senha</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="space-y-4">
                                <LoadingButton
                                    defaultText="Alterar"
                                    loadingText="Alterando..."
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