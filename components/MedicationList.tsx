import React from 'react'
import { FileText, Pill } from 'lucide-react'
import { MedicationRequest } from 'fhir/r4'

import { DrugClassification } from '@/lib/rxnav'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './ui/table'

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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold flex items-center gap-2 uppercase">
                    <FileText className="h-5 w-5" />
                    Active Medications
                </h3>
                <span className="text-sm bg-white px-2 py-1 rounded border border-slate-200">
                    Source: EHR (FHIR R4)
                </span>
            </div>

            <div className="overflow-x-auto">
                {meds.length === 0 ? (
                    <div className="p-10 text-center">
                        No active medications found for this patient in the
                        sandbox.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-foreground text-xs uppercase tracking-wider font-semibold hover:bg-foreground">
                                <TableHead className="text-white px-3 py-4 md:p-6 border-b border-slate-200 w-[40%] md:w-auto">
                                    Medication
                                </TableHead>
                                <TableHead className="text-white px-3 py-4 md:p-6 border-b border-slate-200">
                                    Dosage
                                </TableHead>
                                <TableHead className="text-white px-3 py-4 md:p-6 border-b border-slate-200 hidden md:table-cell">
                                    Prescriber
                                </TableHead>
                                <TableHead className="text-white px-3 py-4 md:p-6 border-b border-slate-200 whitespace-nowrap">
                                    Date
                                </TableHead>
                                <TableHead className="text-white px-3 py-4 md:p-6 border-b border-slate-200 text-right hidden sm:table-cell">
                                    RxNorm
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {meds.map(med => (
                                <TableRow
                                    key={med.id}
                                    className="hover:bg-slate-50/80 transition-colors group"
                                >
                                    <TableCell className="px-3 py-4 md:px-6 font-medium text-slate-900 align-top">
                                        <div className="flex items-start gap-2">
                                            <Pill className="h-4 w-4 mt-1 shrink-0" />
                                            <span className="whitespace-normal wrap-break-words">
                                                {med.name}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-3 py-4 md:px-6 text-sm align-top whitespace-normal">
                                        {med.dosage}
                                    </TableCell>
                                    <TableCell className="px-3 py-4 md:px-6 text-sm align-top hidden md:table-cell">
                                        {med.prescriber}
                                    </TableCell>
                                    <TableCell className="px-3 py-4 md:px-6 text-sm font-mono align-top whitespace-nowrap">
                                        {med.date}
                                    </TableCell>
                                    <TableCell className="px-3 py-4 md:px-6 text-xs font-mono text-right align-top hidden sm:table-cell">
                                        {med.rxNormCode || 'N/A'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    )
}
