import { getPatients } from "@/server/actions/admin/patient.actions";
import { NewPrescriptionForm } from "../../_components/new-prescription-form";

export default async function NewPrescriptionPage() {
  const patients = await getPatients();

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <NewPrescriptionForm patients={patients.data ?? []} />
    </div>
  );
}