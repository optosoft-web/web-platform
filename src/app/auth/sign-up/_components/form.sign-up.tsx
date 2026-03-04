"use client"

import { LoadingButton } from "@/components/shared/loading-button/loading-button"
import { Button } from "@/components/ui/button"
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
import { createClient } from "@/utils/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
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
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    async function handleGoogleSignIn() {
        try {
            setIsGoogleLoading(true);

            // Save priceIdToGo to cookie so the callback can pick it up
            if (priceIdToGo) {
                document.cookie = `priceIdToGo=${priceIdToGo}; path=/; max-age=600; SameSite=Lax`;
            }

            const supabase = createClient();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                toast.error(error.message);
                setIsGoogleLoading(false);
            }
        } catch (error) {
            console.error("Erro no login com Google:", error);
            toast.error("Erro ao entrar com Google.");
            setIsGoogleLoading(false);
        }
    }

    const form = useForm<z.infer<typeof schemaSignUpInput>>({
        resolver: zodResolver(schemaSignUpInput),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmedPassWord: ""
        },
    })

    const { execute: executeSignUp, isPending } = useAction(ActionSignUpUser, {
        onSuccess: async () => {
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
                            <Button
                                variant="outline"
                                type="button"
                                className="w-full"
                                onClick={handleGoogleSignIn}
                                disabled={isGoogleLoading || isPending}
                            >
                                {isGoogleLoading ? (
                                    <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : (
                                    <svg
                                        className="mr-2 h-4 w-4"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                )}
                                Cadastrar com Google
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">
                                        Ou continue com e-mail
                                    </span>
                                </div>
                            </div>

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