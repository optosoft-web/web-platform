"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuthModalStore } from "@/stores/auth-modal-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormSignIn } from "@/app/auth/sign-in/_components/form.sign-in";
import { FormSignUp } from "@/app/auth/sign-up/_components/form.sign-up";

export function AuthModal() {
    const { isOpen, close } = useAuthModalStore();

    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Acesso à sua conta</DialogTitle>
                    <DialogDescription>
                        Para assinar nosso plano, por favor, crie uma conta ou faça login.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="sign-in" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="sign-in">Entrar</TabsTrigger>
                        <TabsTrigger value="sign-up">Criar Conta</TabsTrigger>
                    </TabsList>
                    <TabsContent value="sign-in">
                        <FormSignIn showNavigationLink={false}/>
                    </TabsContent>
                    <TabsContent value="sign-up">
                        <FormSignUp showNavigationLink={false}/>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}