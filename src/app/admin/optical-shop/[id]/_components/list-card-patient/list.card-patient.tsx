import { CardSkeletonOpticalShop } from "@/app/admin/optical-shops/_components/skeletons/optical-shops-skeleton";
import { PatientCard } from "../card-patient/card.patient";
import { iPatient } from "../table-patient/table.patient-columns";


interface iPatientCardListProps {
    patients: iPatient[];
    isLoading?: boolean;
}

export function PatientCardList({ patients, isLoading }: iPatientCardListProps) {

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <CardSkeletonOpticalShop key={index} />
                ))}
            </div>
        );
    }

    if (patients.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-10 bg-secondary rounded-md">
                <h3 className="text-lg font-semibold">Nenhum paciente encontrado</h3>
                <p className="text-sm text-muted-foreground">Tente ajustar sua busca ou adicione um novo paciente.</p>
            </div>
        );
    }

    return (
        // Grid responsiva para os cards
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((patient) => (
                <PatientCard key={patient.id} patient={patient} />
            ))}
        </div>
    );
}