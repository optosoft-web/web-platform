"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { createPrescription } from "@/server/actions/admin/prescription.actions";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { Textarea } from "@/components/ui/textarea";

interface Patient {
    id: string;
    fullName: string;
}

interface NewPrescriptionFormProps {
    patients: Patient[];
}

const sphericalValues = ["+4.00", "+3.75", "+3.50", /* ...adicione todos os valores... */ "+0.25", "0.00", "-0.25", /* ... */ "-4.00"];
const cylindricalValues = ["-0.25", "-0.50", "-0.75", /* ...adicione todos os valores... */ "-3.00"];
const additionValues = ["+0.75", "+1.00", "+1.25", /* ...adicione todos os valores... */ "+3.00"];

const formSchema = z.object({
    patientId: z.string().min(1, "Selecione um paciente."),
    rightEyeSpherical: z.coerce.number<number>().optional(),
    rightEyeCylindrical: z.coerce.number<number>().optional(),
    rightEyeAxis: z.coerce.number<number>().int("O eixo deve ser um número inteiro.").optional(),
    leftEyeSpherical: z.coerce.number<number>().optional(),
    leftEyeCylindrical: z.coerce.number<number>().optional(),
    leftEyeAxis: z.coerce.number<number>().int("O eixo deve ser um número inteiro.").optional(),
    addition: z.coerce.number<number>().optional(),
    notes: z.string().optional(),
    prescriptionDate: z.string(),
});

type PrescriptionFormValues = z.infer<typeof formSchema>;

export function NewPrescriptionForm({ patients }: NewPrescriptionFormProps) {
    const router = useRouter();

    const form = useForm<PrescriptionFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            patientId: patients.length === 1 ? patients[0].id : "",
            notes: "",
        },
    });

    const { execute, status } = useAction(createPrescription, {
        onSuccess: (data) => {
            toast.success(`Prescrição criada para o paciente.`);
            // router.push(`/admin/patients/${data.data.patientId}`);
            form.reset();
            form.clearErrors();
        },
        onError: (error) => {
            toast.error(error.error.serverError || "Não foi possível criar a prescrição.");
        },
    });

    const { isSubmitting } = form.formState;

    function onSubmit(values: PrescriptionFormValues) {
        const dataToSend = {
            ...values,
            prescriptionDate: new Date().toISOString(),
        };

        execute(dataToSend);
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Detalhes da Refração</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="hidden font-medium text-sm text-muted-foreground md:grid md:grid-cols-4 md:gap-4">
                            <div>Olho</div>
                            <div>Esférico</div>
                            <div>Cilíndrico</div>
                            <div>Eixo</div>
                        </div>

                        <div>
                            <FormLabel className="font-bold text-md lg:hidden mb-2 block">OD</FormLabel>
                            <div className="flex w-full items-start gap-3"> 

                                <FormField
                                    control={form.control}
                                    name="rightEyeSpherical"
                                    render={({ field }) => (
                                        <FormItem className="w-1/3">
                                            <FormLabel>Esférico</FormLabel>
                                            <Select
                                                onValueChange={(stringValue) => field.onChange(Number(stringValue))}
                                                defaultValue={field.value?.toString() ?? ""}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="0,00" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {sphericalValues.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="rightEyeCylindrical"
                                    render={({ field }) => (
                                        <FormItem className="w-1/3">
                                            <FormLabel>Cilíndrico</FormLabel>
                                            <Select
                                                onValueChange={(stringValue) => field.onChange(Number(stringValue))}
                                                defaultValue={field.value?.toString() ?? ""}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="0,00" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {cylindricalValues.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="rightEyeAxis"
                                    render={({ field }) => (
                                        <FormItem className="w-1/3">
                                            <FormLabel>Eixo</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Eixo"
                                                    type="number"
                                                    {...field}
                                                    onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)}
                                                    value={field.value ?? ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div>
                            <FormLabel className="font-bold text-md mb-2 block lg:hidden">OE</FormLabel>
                            <div className="flex w-full items-start gap-3">

                                <FormField
                                    control={form.control}
                                    name="leftEyeSpherical"
                                    render={({ field }) => (
                                        <FormItem className="w-1/3">
                                            <FormLabel>Esférico</FormLabel>
                                            <Select
                                                onValueChange={(stringValue) => field.onChange(Number(stringValue))}
                                                defaultValue={field.value?.toString() ?? ""}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="0,00" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {sphericalValues.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="leftEyeCylindrical"
                                    render={({ field }) => (
                                        <FormItem className="w-1/3">
                                            <FormLabel>Cilíndrico</FormLabel>
                                            <Select
                                                onValueChange={(stringValue) => field.onChange(Number(stringValue))}
                                                defaultValue={field.value?.toString() ?? ""}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="0,00" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {cylindricalValues.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="leftEyeAxis"
                                    render={({ field }) => (
                                        <FormItem className="w-1/3">
                                            <FormLabel>Eixo</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Eixo"
                                                    type="number"
                                                    {...field}
                                                    onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)}
                                                    value={field.value ?? ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Card para Adição e Observações */}
                <Card>
                    <CardHeader>
                        <CardTitle>Adição e Observações</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="addition"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Adição (Presbiopia)</FormLabel>
                                    <Select onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="+0,00" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {additionValues.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição / Observações</FormLabel>
                                    <FormControl><Textarea placeholder="Ex: Lentes com filtro azul, antirreflexo..." className="resize-none" {...field} value={field.value ?? ""} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Prescrição
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}