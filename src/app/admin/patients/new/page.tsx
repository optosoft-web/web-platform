import { getPatients } from "@/server/actions/admin/patient.actions";
import { PrescriptionFlow } from "../_components/prescription-flow";
import { QueryProvider } from "@/components/shared/query-provider/query-provider";

export default async function NewPrescriptionPage() {
    const patients = await getPatients();

    return (
        <QueryProvider>
            <div className="container mx-auto max-w-2xl py-8">
                <PrescriptionFlow />
            </div>
        </QueryProvider>
    );
}