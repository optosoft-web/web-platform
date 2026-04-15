"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { EllipsisVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatDate } from "@/lib/utils";
import { iPatient } from "../table-patient/table.patient-columns";

interface iTopicProps {
    label: string;
    value: string | number | null | undefined;
}

function Topic(props: iTopicProps) {
    return (
        <div>
            <div className="text-sm text-muted-foreground">{props.label}</div>
            <div className="truncate font-medium" title={String(props.value)}>{props.value || '-'}</div>
        </div>
    );
}

interface iPatientCardProps {
    patient: iPatient;
    onCreatePrescription?: (patient: { id: string; fullName: string }) => void;
}

function formartPatientBirthDate(dateOfBirth: string | null) {
    let birthDateDisplay = '-';

    if (dateOfBirth) {
        const formattedDateOfBirth = formatDate(dateOfBirth);

        const birthDate = new Date(dateOfBirth);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        const ageString = `${age} ano${age !== 1 ? 's' : ''}`;
        birthDateDisplay = `${formattedDateOfBirth} (${ageString})`;
    }

    return birthDateDisplay
}

export function PatientCard({ patient, onCreatePrescription }: iPatientCardProps) {
    const formattedCreatedAt = formatDate(patient.createdAt);
    const formattedBirthDate = formartPatientBirthDate(patient.dateOfBirth)

    return (
        <Card className="w-full shadow-none p-0">
            <CardHeader className="flex flex-row items-center justify-between pt-6">
                <CardTitle className="flex justify-between w-full items-center">
                    <h2 className="font-semibold text-xl truncate">{patient.fullName}</h2>
                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "h-8 w-8")}>
                                <EllipsisVertical className="h-5 w-5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => onCreatePrescription?.({ id: patient.id, fullName: patient.fullName })}>Criar Receita</DropdownMenuItem>
                                <DropdownMenuItem>Editar Paciente</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className={cn(
                                        buttonVariants({ variant: 'destructive', size: 'sm' }),
                                        'w-full justify-start focus:bg-destructive focus:text-destructive-foreground'
                                    )}
                                >
                                    Excluir
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="px-6 space-y-3">
                    <Topic label="Data de Nascimento" value={formattedBirthDate} />
                    <Topic label="Contato" value={patient.contactInfo} />
                </div>
            </CardContent>
            <CardFooter className="border-t flex px-6 pb-0 py-2!">
                <div className="flex gap-1 text-sm items-center">
                    <div className="text-muted-foreground">Criado em</div>
                    <div className="font-medium">{formattedCreatedAt}</div>
                </div>
            </CardFooter>
        </Card>
    );
}