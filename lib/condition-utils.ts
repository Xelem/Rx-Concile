import { Bundle, MedicationRequest, Patient, Condition } from 'fhir/r4'

export interface ConditionI {
    id: string
    name: string
    status: string
    date: string
}

const returnMappedConditions = (bundle: Bundle<Condition>) => {
    const mappedConditions: ConditionI[] = bundle.entry!.map((entry: any) => ({
        id: entry.resource.id,
        name:
            entry.resource.code?.text ||
            entry.resource.code?.coding?.[0]?.display ||
            'Unknown Condition',
        status: entry.resource.clinicalStatus?.coding?.[0]?.code || 'active',
        date:
            entry.resource.recordedDate ||
            entry.resource.onsetDateTime?.split('T')[0] ||
            'N/A',
    }))

    return mappedConditions
}

export default returnMappedConditions
