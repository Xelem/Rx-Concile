'use client'

import { useSmart } from './context/SmartContext'
import {
    AlertCircle,
    AlertTriangle,
    Pill,
    RefreshCw,
    XCircle,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { MedicationRequest, BundleEntry, Coding } from 'fhir/r4'
import MedicationList, {
    MappedMedicationRequest,
} from '@/components/MedicationList'
import { RxNavService } from '@/lib/rxnav'
import { findDuplicates } from '@/lib/medication-utils'

interface Alert {
    title: string
    description: string
    medsInvolved: string[]
}

export default function DashboardPage() {
    const { patient, medsBundle, error, loading } = useSmart()
    const [meds, setMeds] = useState<MappedMedicationRequest[]>([])
    const [alert, setAlert] = useState<Alert | null>(null)

    useEffect(() => {
        const fetchMeds = async () => {
            if (medsBundle?.entry) {
                const mappedMedsPromises = medsBundle.entry.map(
                    async (entry: BundleEntry) => {
                        const res = entry.resource as MedicationRequest

                        // Extract RxNorm Code (if available) for later use
                        const coding =
                            res.medicationCodeableConcept?.coding?.find(
                                (c: Coding) =>
                                    c.system ===
                                    'http://www.nlm.nih.gov/research/umls/rxnorm',
                            )

                        const rxNavService = RxNavService.getInstance()
                        const drugClasses = await rxNavService.getDrugClasses([
                            coding?.code || '',
                        ])

                        return {
                            id: res.id,
                            name:
                                res.medicationCodeableConcept?.text ||
                                coding?.display ||
                                'Unknown Medication',
                            prescriber:
                                res.requester?.display || 'Unknown Provider',
                            status: res.status,
                            date: res.authoredOn?.split('T')[0] || 'N/A',
                            dosage:
                                res.dosageInstruction?.[0]?.text ||
                                'As directed',
                            rxNormCode: coding?.code,
                            drugClasses: drugClasses,
                        }
                    },
                )

                const mappedMeds = await Promise.all(mappedMedsPromises)
                setMeds(mappedMeds)
                checkForDuplicates(mappedMeds)
            }
        }

        fetchMeds()
    }, [medsBundle])

    const checkForDuplicates = (medications: MappedMedicationRequest[]) => {
        const duplicates = findDuplicates(medications)
        if (duplicates.length > 0) {
            // For now, just take the first duplicate group found
            const firstGroup = duplicates[0]

            setAlert({
                title:
                    firstGroup.type === 'Exact'
                        ? 'Duplicate Medication Found'
                        : 'Therapeutic Duplication Warning',
                description:
                    firstGroup.type === 'Exact'
                        ? `Multiple prescriptions found for ${firstGroup.matchKey}.`
                        : `Multiple active medications found in class: ${firstGroup.matchKey}. This may indicate redundant therapy.`,
                medsInvolved: firstGroup.medications.map(m => m.name),
            })
        } else {
            setAlert(null)
        }
    }

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">
                        Loading Patient Context...
                    </p>
                </div>
            </div>
        )

    if (error)
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
                    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                        Connection Error
                    </h2>
                    <p className="text-slate-500 mb-8">{error}</p>
                    <a
                        href="/launch"
                        className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                    >
                        <RefreshCw className="h-5 w-5" />
                        Relaunch App
                    </a>
                </div>
            </div>
        )

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="mb-8">
                <div className="bg-slate-900 text-white shadow-md">
                    {patient && (
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-600">
                                        <span className="text-xl font-bold">
                                            {
                                                patient?.name?.[0]
                                                    ?.given?.[0]?.[0]
                                            }
                                            {patient?.name?.[0]?.family?.[0]}
                                        </span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold leading-tight">
                                            {patient?.name?.[0]?.given?.join(
                                                ' ',
                                            )}{' '}
                                            {patient?.name?.[0]?.family}
                                        </h2>
                                        <p className="text-slate-400 text-sm">
                                            DOB: {patient?.birthDate} • Sex:{' '}
                                            {patient?.gender} • ID:{' '}
                                            {patient?.id}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* THE ALERT SECTION (Dynamically Rendered) */}
                {alert && (
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
                                    <p className="text-red-700 mb-4">
                                        {alert.description}
                                    </p>

                                    <div className="bg-white/60 rounded-md border border-red-100 overflow-hidden mb-4">
                                        {alert.medsInvolved.map(
                                            (medName, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-2 p-3 border-b border-red-100 last:border-0"
                                                >
                                                    <Pill className="h-4 w-4 text-slate-500" />
                                                    <span className="font-medium text-slate-900">
                                                        {medName}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>

                                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors flex items-center gap-2">
                                        <XCircle className="h-4 w-4" />
                                        Review & Discontinue
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. MEDICATION LIST TABLE */}
                <MedicationList meds={meds} />
            </div>
        </div>
    )
}
