"use client";

import { useEffect, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { ActionGetProfile, ActionUpdateProfile } from "@/server/actions/admin/profile.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/shared/loading-button/loading-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
    const [fullName, setFullName] = useState("");
    const [optometristName, setOptometristName] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);

    const getProfileAction = useAction(ActionGetProfile, {
        onSuccess: ({ data }) => {
            if (data) {
                setFullName(data.fullName || "");
                setOptometristName(data.optometristName || "");
            }
            setIsLoaded(true);
        },
        onError: () => {
            toast.error("Erro ao carregar perfil.");
            setIsLoaded(true);
        },
    });

    const updateProfileAction = useAction(ActionUpdateProfile, {
        onSuccess: () => {
            toast.success("Perfil atualizado com sucesso!");
        },
        onError: ({ error }) => {
            toast.error(error.serverError || "Erro ao atualizar perfil.");
        },
    });

    useEffect(() => {
        getProfileAction.execute();
    }, []);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        updateProfileAction.execute({
            fullName: fullName.trim() || undefined,
            optometristName: optometristName.trim() || undefined,
        });
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Minha Conta</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Configurações do Perfil</CardTitle>
                    <CardDescription>
                        Configure suas informações profissionais. O nome do optometrista será preenchido automaticamente nas receitas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!isLoaded ? (
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-40" />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="fullName">Nome completo</Label>
                                <Input
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Ex: João da Silva"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Este nome será exibido no cabeçalho e na sua conta.
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="optometristName">Nome do Optometrista / Médico</Label>
                                <Input
                                    id="optometristName"
                                    value={optometristName}
                                    onChange={(e) => setOptometristName(e.target.value)}
                                    placeholder="Dr. João da Silva"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Este nome será utilizado automaticamente no campo &quot;Prescrito por&quot; em todas as receitas.
                                </p>
                            </div>
                            <LoadingButton
                                type="submit"
                                isLoading={updateProfileAction.isPending}
                                defaultText="Salvar"
                                loadingText="Salvando..."
                            />
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
