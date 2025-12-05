import React from 'react'
import { AlertTriangle, Pill, XCircle } from 'lucide-react'

export interface Alert {
    title: string
    description: string
    medsInvolved: string[]
}

interface AlertSectionProps {
    alert: Alert | null
}

export default function AlertSection({ alert }: AlertSectionProps) {
    if (!alert) return null

    return (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm p-6 relative">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-red-100 rounded-full shrink-0">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-red-900 mb-1">
                            {alert.title}
                        </h3>
                        <p className="text-red-700 mb-4">{alert.description}</p>

                        <div className="bg-white/60 rounded-md border border-red-100 overflow-hidden mb-4">
                            {alert.medsInvolved.map((medName, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2 p-3 border-b border-red-100 last:border-0"
                                >
                                    <Pill className="h-4 w-4 text-slate-500" />
                                    <span className="font-medium text-slate-900">
                                        {medName}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            Review & Discontinue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
