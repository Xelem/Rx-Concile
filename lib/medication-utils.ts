import { MappedMedicationRequest } from '@/components/MedicationList'

export interface DuplicateGroup {
    type: 'Exact' | 'Therapeutic'
    medications: MappedMedicationRequest[]
    matchKey: string
}

export function findDuplicates(
    meds: MappedMedicationRequest[],
): DuplicateGroup[] {
    const duplicates: DuplicateGroup[] = []

    const rxNormMap = new Map<string, MappedMedicationRequest[]>()
    meds.forEach(med => {
        if (med.rxNormCode) {
            const existing = rxNormMap.get(med.rxNormCode) || []
            rxNormMap.set(med.rxNormCode, [...existing, med])
        }
    })

    rxNormMap.forEach((group, code) => {
        if (group.length > 1) {
            duplicates.push({
                type: 'Exact',
                medications: group,
                matchKey: code,
            })
        }
    })

    const classMap = new Map<string, MappedMedicationRequest[]>()

    meds.forEach(med => {
        med.drugClasses?.forEach(drugClass => {
            drugClass.classes.forEach(cls => {
                const key = cls.className
                const existing = classMap.get(key) || []

                if (!existing.find(m => m.id === med.id)) {
                    classMap.set(key, [...existing, med])
                }
            })
        })
    })

    classMap.forEach((group, className) => {
        if (group.length > 1) {
            duplicates.push({
                type: 'Therapeutic',
                medications: group,
                matchKey: className,
            })
        }
    })

    return duplicates
}
