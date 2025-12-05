import React from 'react'
import { FileText, Pill } from 'lucide-react'
import { MedicationRequest } from 'fhir/r4'

import { DrugClassification } from '@/lib/rxnav'

export interface MappedMedicationRequest
    extends Pick<MedicationRequest, 'id' | 'status'> {
    name: string
    prescriber: string
    date: string
    dosage: string
    rxNormCode?: string
    drugClasses?: DrugClassification[]
}

interface MedicationListProps {
    meds: MappedMedicationRequest[]
}

export default function MedicationList({ meds }: MedicationListProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-slate-400" />
                    Active Medications
                </h3>
                <span className="text-sm text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                    Source: EHR (FHIR R4)
                </span>
            </div>

            <div className="overflow-x-auto">
                {meds.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">
                        No active medications found for this patient in the
                        sandbox.
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="px-6 py-4 border-b border-slate-200">
                                    Medication
                                </th>
                                <th className="px-6 py-4 border-b border-slate-200">
                                    Dosage
                                </th>
                                <th className="px-6 py-4 border-b border-slate-200">
                                    Prescriber
                                </th>
                                <th className="px-6 py-4 border-b border-slate-200">
                                    Date
                                </th>
                                <th className="px-6 py-4 border-b border-slate-200 text-right">
                                    RxNorm
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {meds.map(med => (
                                <tr
                                    key={med.id}
                                    className="hover:bg-slate-50/80 transition-colors group"
                                >
                                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <Pill className="h-4 w-4" />
                                        </div>
                                        {med.name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">
                                        {med.dosage}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">
                                        {med.prescriber}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm font-mono">
                                        {med.date}
                                    </td>
                                    <td className="px-6 py-4 text-right text-xs text-slate-400 font-mono">
                                        {med.rxNormCode || 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
