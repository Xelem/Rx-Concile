import React from 'react'
import { Stethoscope } from 'lucide-react'
import { ConditionI } from '@/lib/condition-utils'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './ui/table'

interface ConditionListProps {
    conditions: ConditionI[]
}

export default function ConditionList({ conditions }: ConditionListProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8 animate-in fade-in duration-300">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 uppercase">
                    <Stethoscope className="h-5 w-5" />
                    Patient Conditions
                </h3>
                <span className="text-sm bg-white px-2 py-1 rounded border border-slate-200">
                    Source: EHR (FHIR R4)
                </span>
            </div>

            <div className="overflow-x-auto">
                {conditions.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">
                        No active conditions found for this patient.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-foreground text-xs uppercase tracking-wider font-semibold hover:bg-foreground">
                                <TableHead className="text-white p-6 border-b border-slate-200">
                                    Condition Name
                                </TableHead>
                                <TableHead className="text-white p-6 border-b border-slate-200">
                                    Status
                                </TableHead>
                                <TableHead className="text-white p-6 border-b border-slate-200 text-right">
                                    Recorded Date
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {conditions.map(cond => (
                                <TableRow
                                    key={cond.id}
                                    className="hover:bg-slate-50/80 transition-colors group"
                                >
                                    <TableCell className="px-6 py-4 font-medium text-slate-900">
                                        {cond.name}
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 capitalize">
                                            {cond.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-slate-500 text-sm font-mono text-right">
                                        {cond.date}
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
