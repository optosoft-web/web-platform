"use client"

import { createCheckoutSession } from "@/server/actions/stripe.action"
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
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { ActionSignInUser } from "../actions"


const schemaSignInInput = z.object({
    email: z.email().min(1, "O e-mail é obrigatório."),
    password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
})

export function FormSignIn({
    className,
    showNavigationLink = true,
    ...props
}: React.ComponentProps<"div"> & {
    showNavigationLink?: boolean
}) {
    const { close: closeAuthModal, priceIdToGo, clearPriceId } = useAuthModalStore();
    const router = useRouter();

    const form = useForm<z.infer<typeof schemaSignInInput>>({
        resolver: zodResolver(schemaSignInInput),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const { execute, isPending } = useAction(ActionSignInUser, {
        onSuccess: async () => {
            toast.success("Login bem-sucedido!");
            closeAuthModal();

            if (priceIdToGo) {
                const result = await createCheckoutSession({
                    priceId: priceIdToGo
                })
                if (result?.data?.url) {
                    clearPriceId();
                    router.push(result.data.url);
                }
                return;
            }

            router.push('/admin/dashboard')
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

    async function onSubmit(values: z.infer<typeof schemaSignInInput>) {
        try {
            execute(values);
        } catch (error) {
            console.error("Erro no login:", error)
            toast.error(String(error))
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Bem-vindo de volta!</CardTitle>
                    <CardDescription>Entre com sua conta para continuar</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <Button variant="outline" type="button" className="w-full">
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
                                Entrar com Google
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">
                                        Ou continue com
                                    </span>
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>E-mail</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="m@example.com"
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
                                        <div className="flex items-center">
                                            <FormLabel>Senha</FormLabel>
                                            <Link
                                                href={"/auth/forgot-password"}
                                                className="ml-auto text-sm underline-offset-4 hover:underline"
                                            >
                                                Esqueceu sua senha?
                                            </Link>
                                        </div>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4">
                                <LoadingButton
                                    defaultText="Entrar"
                                    loadingText="Entrando..."
                                    isLoading={isPending}
                                    type="submit"
                                    className="w-full"
                                />
                                {showNavigationLink && (
                                    <FormDescription className="text-center">
                                        Não possui uma conta?{" "}
                                        <Link href="/auth/sign-up" className="underline-offset-4 hover:underline" aria-disabled={isPending}>
                                            Registre-se
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