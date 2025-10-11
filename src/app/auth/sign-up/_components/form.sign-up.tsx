"use client"

import { LoadingButton } from "@/components/shared/loading-button/loading-button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAuthModalStore } from "@/stores/auth-modal-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { ActionSignUpUser } from "../actions"
import { createCheckoutSession } from "@/server/actions/stripe.action"

const schemaSignUpInput = z.object({
    fullName: z.string().min(5),
    email: z.email().min(1, "O e-mail é obrigatório."),
    password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
    confirmedPassWord: z.string().min(8, "A senha deve ter no mínimo 8 caracteres.")
}).refine((data) => data.password === data.confirmedPassWord, {
    message: "As senhas não são iguais.",
    path: ["confirmedPassWord"],
});

export function FormSignUp({
    className,
    showNavigationLink = true,
    ...props
}: React.ComponentProps<"div"> & {
    showNavigationLink?: boolean
}) {
    const router = useRouter();
    const { close: closeAuthModal, priceIdToGo, clearPriceId } = useAuthModalStore();

    const form = useForm<z.infer<typeof schemaSignUpInput>>({
        resolver: zodResolver(schemaSignUpInput),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmedPassWord: ""
        },
    })

    const { execute: executeSignUp, isPending, result } = useAction(ActionSignUpUser, {
        onSuccess: async (data) => {
            toast.success("Cadastro realizado com sucesso!");
            closeAuthModal();

            if (priceIdToGo) {
                const result = await createCheckoutSession({
                    priceId: priceIdToGo
                })
                if (result?.data?.url) {
                    clearPriceId();
                    router.push(result.data.url);
                    return;
                }

            }

            router.push("/auth/sign-in");
        },
        onError: ({ error }) => {
            if (error.serverError) {
                toast.error(error.serverError)
            }
            if (error.validationErrors) {
                console.log(error.validationErrors);
            }
        }
    })


    async function onSubmit(values: z.infer<typeof schemaSignUpInput>) {
        try {
            executeSignUp(values);
        } catch (error) {
            console.error("Erro no login:", error)
            toast.error(String(error))
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Crie sua conta</CardTitle>
                    <CardDescription>Preencha o formulário abaixo para criar sua conta</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome completo</FormLabel>
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
                                    defaultText="Cadastrar"
                                    loadingText="Cadastrando..."
                                    isLoading={isPending}
                                    type="submit"
                                    className="w-full"
                                />
                                {showNavigationLink && (
                                    <FormDescription className="text-center">
                                        Possui uma conta?{" "}
                                        <Link href="/auth/sign-in" className="underline-offset-4 hover:underline" aria-disabled={isPending}>
                                            Entre por aqui
                                        </Link>
                                    </FormDescription>
                                )}
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}