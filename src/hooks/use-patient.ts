import { iPatient } from "@/app/admin/optical-shop/[id]/_components/table-patient/table.patient-columns";
import { ActionSearchPatients } from "@/server/actions/admin/patient.actions";
import { useQuery } from "@tanstack/react-query";

interface iUsePatientsOptions {
    query?: string;
    limit?: number;
    offset?: number;
    sortColumn?: string;
    sortOrder?: 'asc' | 'desc';
}

interface iFetchResult {
    data: iPatient[];
    totalCount: number;
}

const fetchPatients = async (options: iUsePatientsOptions): Promise<iFetchResult> => {
    const result = await ActionSearchPatients({
        query: options.query,
        limit: options.limit,
        offset: options.offset,
        sortColumn: options.sortColumn,
        sortOrder: options.sortOrder,
    });

    if (result.serverError || result.validationErrors) {
        throw new Error(result.serverError || "Ocorreu um erro de validação.");
    }

    if (!result.data) {
        throw new Error("A ação não retornou dados ou um erro esperado.");
    }

    return result.data;
};

const usePatients = (options: iUsePatientsOptions) => {
    return useQuery<iFetchResult>({
        queryKey: ['patients', options],
        queryFn: () => fetchPatients(options),
    });
};

export { usePatients };