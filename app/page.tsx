'use client'

import { useSmart } from './context/SmartContext'
import { AlertCircle, CheckCircle2Icon, RefreshCw } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { MedicationRequest, BundleEntry, Coding } from 'fhir/r4'
import MedicationList, {
    MappedMedicationRequest,
} from '@/components/MedicationList'
import { RxNavService } from '@/lib/rxnav'
import { findDuplicates } from '@/lib/medication-utils'
import AlertSection, { Alert } from '@/components/AlertSection'
import AlertBox from '@/components/AlertBox'

export default function DashboardPage() {
    const { patient, medsBundle, error, loading, client } = useSmart()
    const [meds, setMeds] = useState<MappedMedicationRequest[]>([])
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [feedbackAlert, setFeedbackAlert] = useState<{
        type: 'success' | 'error'
        title: string
        description: string
    } | null>(null)

    const fetchMeds = useCallback(async () => {
        if (medsBundle?.entry) {
            const mappedMedsPromises = medsBundle.entry.map(
                async (entry: BundleEntry) => {
                    const res = entry.resource as MedicationRequest
                    const coding = res.medicationCodeableConcept?.coding?.find(
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
                            res.dosageInstruction?.[0]?.text || 'As directed',
                        rxNormCode: coding?.code,
                        drugClasses: drugClasses,
                    }
                },
            )

            const mappedMeds = await Promise.all(mappedMedsPromises)
            // Filter out stopped meds to simulate a fresh fetch that excludes them
            const activeMeds = mappedMeds.filter(
                m => m.status !== 'stopped' && m.status !== 'entered-in-error',
            )
            setMeds(activeMeds)
            checkForDuplicates(activeMeds)
        }
    }, [medsBundle])

    useEffect(() => {
        fetchMeds()
    }, [fetchMeds])

    useEffect(() => {
        if (feedbackAlert) {
            const timer = setTimeout(() => {
                setFeedbackAlert(null)
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [feedbackAlert])

    const checkForDuplicates = (medications: MappedMedicationRequest[]) => {
        const duplicates = findDuplicates(medications)
        if (duplicates.length > 0) {
            duplicates.forEach(duplicate => {
                setAlerts(prevAlerts => [
                    ...prevAlerts,
                    {
                        title:
                            duplicate.type === 'Exact'
                                ? 'Duplicate Medication Found'
                                : 'Therapeutic Duplication Warning',
                        description:
                            duplicate.type === 'Exact'
                                ? `Multiple prescriptions found for ${duplicate.matchKey}.`
                                : `Multiple active medications found in class: ${duplicate.matchKey}. This may indicate redundant therapy.`,
                        medsInvolved: duplicate.medications.map(m => ({
                            name: m.name,
                            id: m.id,
                        })),
                    },
                ])
            })
        } else {
            setAlerts([])
        }
    }

    const discontinueMedication = async (medId: string) => {
        if (!client) return
        setProcessingId(medId)

        try {
            const resource = await client.request(`MedicationRequest/${medId}`)

            resource.status = 'stopped'
            resource.statusReason = {
                text: 'Duplicate therapy discontinued via RxConcile',
            }

            await client.update(resource)
            // Re-fetch meds to reflect the status change
            // In a real app with a real FHIR server, we would re-fetch from the server.
            // Here, we update the local bundle or just re-run the mapping logic
            // which now filters out 'stopped' meds.
            // Ideally, we should update the medsBundle in the context, but for now
            // we'll manually update the local state by re-running fetchMeds
            // which we've updated to filter out stopped meds.

            // However, since we are just modifying the resource in place (if the client cache works that way)
            // or we need to manually update our local view.
            // Let's manually update the meds list to remove the discontinued one for immediate feedback.

            setMeds(prevMeds => {
                const updatedMeds = prevMeds.filter(m => m.id !== medId)
                checkForDuplicates(updatedMeds)
                return updatedMeds
            })

            setFeedbackAlert({
                type: 'success',
                title: 'Success',
                description: 'Medication stopped.',
            })
        } catch (err) {
            console.error('Write-back failed', err)

            setFeedbackAlert({
                type: 'error',
                title: 'Simulated Write',
                description:
                    'Order would be discontinued (Sandbox permission restricted).',
            })
        } finally {
            setProcessingId(null)
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

                {feedbackAlert && (
                    <div className="max-w-7xl mx-auto py-2">
                        <AlertBox
                            icon={
                                feedbackAlert.type === 'success' ? (
                                    <CheckCircle2Icon className="h-4 w-4" />
                                ) : (
                                    <AlertCircle className="h-4 w-4" />
                                )
                            }
                            title={feedbackAlert.title}
                            description={feedbackAlert.description}
                            variant={
                                feedbackAlert.type === 'error'
                                    ? 'destructive'
                                    : 'default'
                            }
                        />
                    </div>
                )}

                {alerts &&
                    alerts.length > 0 &&
                    alerts.map((alert, idx) => (
                        <AlertSection
                            key={idx}
                            alert={alert}
                            processingId={processingId}
                            onDiscontinue={discontinueMedication}
                        />
                    ))}

                <MedicationList meds={meds} />
            </div>
        </div>
    )
}
