import { AlertTriangle, Pill, Trash2 } from 'lucide-react'
import AlertButton from './AlertButton'

export interface Alert {
    title: string
    description: string
    medsInvolved: { name: string; id?: string }[]
}

interface AlertSectionProps {
    alert: Alert | null
    processingId: string | null
    onDiscontinue: (medId: string) => void
}

export default function AlertSection({
    alert,
    processingId,
    onDiscontinue,
}: AlertSectionProps) {
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
                            {alert.medsInvolved.map((med, idx) => (
                                <div
                                    key={med.id || idx}
                                    className="flex items-center justify-between p-3 border-b border-red-100 last:border-0"
                                >
                                    <div className="flex items-center gap-2">
                                        <Pill className="h-4 w-4 text-slate-500" />
                                        <span className="font-medium text-slate-900">
                                            {med.name}
                                        </span>
                                    </div>
                                    <AlertButton
                                        onClick={() =>
                                            med.id && onDiscontinue(med.id)
                                        }
                                        disabled={!med.id || !!processingId}
                                        text={
                                            processingId === med.id
                                                ? 'Updating...'
                                                : 'Stop'
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="text-sm text-red-600 underline decoration-dotted hover:text-red-800">
                        Dismiss Warning
                    </button>
                </div>
            </div>
        </div>
    )
}
