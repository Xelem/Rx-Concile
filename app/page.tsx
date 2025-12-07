'use client'

import { useSmart } from './context/SmartContext'
import {
    AlertCircle,
    CheckCircle2Icon,
    ClipboardList,
    PlusCircle,
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { MedicationRequest, BundleEntry, Coding } from 'fhir/r4'
import MedicationList, {
    MappedMedicationRequest,
} from '@/components/MedicationList'
import { RxNavService } from '@/lib/rxnav'
import { findDuplicates } from '@/lib/medication-utils'
import AlertSection, { Alert } from '@/components/AlertSection'
import AlertBox from '@/components/AlertBox'
import Error from '@/components/Error'
import returnMappedConditions, { ConditionI } from '@/lib/condition-utils'
import { Button } from '@/components/ui/button'
import ConditionList from '@/components/ConditionList'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PRESET_DRUGS from '@/lib/preset-drugs.json'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function DashboardPage() {
    const {
        patient,
        medsBundle,
        error,
        loading,
        client,
        refreshMeds,
        conditionBundle,
        user,
    } = useSmart()

    // Data States
    const [meds, setMeds] = useState<MappedMedicationRequest[]>([])
    const [conditions, setConditions] = useState<ConditionI[]>([])
    const [selectedDrugIndex, setSelectedDrugIndex] = useState<number | null>(
        null,
    )
    const [dosageInstructions, setDosageInstructions] = useState<string>('')

    // UI States
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(
        new Set(),
    )
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [feedbackAlert, setFeedbackAlert] = useState<{
        type: 'success' | 'error'
        title: string
        description: string
    } | null>(null)
    const [activeView, setActiveView] = useState<'meds' | 'conditions'>('meds')

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
        if (conditionBundle)
            setConditions(returnMappedConditions(conditionBundle))
    }, [conditionBundle])

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
        const newAlerts: Alert[] = []

        if (duplicates.length > 0) {
            duplicates.forEach(duplicate => {
                const alertId = duplicate.matchKey
                if (!dismissedAlertIds.has(alertId)) {
                    newAlerts.push({
                        id: alertId,
                        title:
                            duplicate.type === 'Exact'
                                ? 'Duplicate Medication Found'
                                : 'Therapeutic Duplication Warning',
                        description:
                            duplicate.type === 'Exact'
                                ? `Patient is prescribed multiple medications from the class ${duplicate.matchKey}.`
                                : `Multiple active medications found in class: ${duplicate.matchKey}. This may indicate redundant therapy.`,
                        medsInvolved: duplicate.medications.map(m => ({
                            name: m.name,
                            id: m.id,
                        })),
                    })
                }
            })
        }
        setAlerts(newAlerts)
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
            await refreshMeds()

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

    const handlePrescribe = async () => {
        if (!client || selectedDrugIndex === null) return

        const drug = PRESET_DRUGS[selectedDrugIndex]
        setProcessingId('PRESCRIBE') // Re-use state to show loading on button

        const newMedRequest = {
            resourceType: 'MedicationRequest',
            status: 'active',
            intent: 'order',
            medicationCodeableConcept: {
                coding: [
                    {
                        system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                        code: drug.code,
                        display: drug.name,
                    },
                ],
                text: drug.name,
            },
            subject: {
                reference: `Patient/${client.patient.id}`,
            },
            requester: {
                reference: client.user.fhirUser,
                display: user
                    ? `${user.name?.[0]?.given?.join(' ') || ''} ${
                          user.name?.[0]?.family || ''
                      }`.trim() || 'Unknown Provider'
                    : 'Unknown Provider',
            },
            authoredOn: new Date().toISOString().split('T')[0],
            dosageInstruction: [
                {
                    text: dosageInstructions,
                },
            ],
        }

        try {
            await client.create(newMedRequest)
            await refreshMeds()
            setFeedbackAlert({
                type: 'success',
                title: 'Prescription Sent',
                description: `Successfully prescribed ${drug.name}.`,
            })
            // Reset form
            setSelectedDrugIndex(null)
            setDosageInstructions('')
        } catch (err) {
            console.error('Create failed', err)
            setFeedbackAlert({
                type: 'error',
                title: 'Prescription Failed',
                description: 'Failed to create medication request.',
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
                <Error error={error} />
            </div>
        )

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mb-8">
                <div className="bg-foreground text-white shadow-md">
                    {patient && (
                        <div className="sm:px-6 lg:px-8 py-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className=" bg-white/10">
                                        <AvatarFallback className=" bg-white/10 border-2 border-slate-600">
                                            {' '}
                                            {
                                                patient?.name?.[0]
                                                    ?.given?.[0]?.[0]
                                            }
                                            {patient?.name?.[0]?.family?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
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

                                <div className="flex gap-3">
                                    <Button
                                        onClick={() =>
                                            setActiveView(
                                                activeView === 'meds'
                                                    ? 'conditions'
                                                    : 'meds',
                                            )
                                        }
                                        className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
                                    >
                                        <ClipboardList className="h-4 w-4" />
                                        {activeView === 'meds'
                                            ? 'View Conditions'
                                            : 'View Meds'}
                                    </Button>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className=" bg-blue-600 hover:bg-blue-500">
                                                <PlusCircle className="h-4 w-4" />
                                                Add Medication
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Prescribe Medication
                                                </DialogTitle>
                                            </DialogHeader>

                                            <div>
                                                <Label className="block text-sm font-medium text-slate-700 mb-1">
                                                    Select Medication
                                                </Label>
                                                <Select
                                                    onValueChange={val => {
                                                        const idx =
                                                            PRESET_DRUGS.findIndex(
                                                                d =>
                                                                    d.code ===
                                                                    val,
                                                            )
                                                        setSelectedDrugIndex(
                                                            idx,
                                                        )
                                                    }}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select a medication" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectLabel>
                                                                Medications
                                                            </SelectLabel>
                                                            {PRESET_DRUGS.map(
                                                                (drug, idx) => (
                                                                    <SelectItem
                                                                        key={
                                                                            idx
                                                                        }
                                                                        value={
                                                                            drug.code
                                                                        }
                                                                    >
                                                                        {
                                                                            drug.name
                                                                        }{' '}
                                                                        (
                                                                        {
                                                                            drug.class
                                                                        }
                                                                        )
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    RxNorm Code:{' '}
                                                    {selectedDrugIndex !== null
                                                        ? PRESET_DRUGS[
                                                              selectedDrugIndex
                                                          ].code
                                                        : 'NA'}
                                                </p>

                                                <Label className="block text-sm font-medium text-slate-700 mb-1 mt-3">
                                                    Dosage Instructions
                                                </Label>
                                                <Input
                                                    type="text"
                                                    placeholder="e.g. Take 1 tablet daily"
                                                    value={dosageInstructions}
                                                    onChange={e =>
                                                        setDosageInstructions(
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="bg-blue-50 p-3 rounded-md text-blue-700 text-xs">
                                                <strong>Note:</strong>{' '}
                                                Prescribing a drug from the same
                                                class as an existing medication
                                                will trigger the Clinical
                                                Decision Support alert.
                                            </div>
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button variant="outline">
                                                        Cancel
                                                    </Button>
                                                </DialogClose>
                                                <Button
                                                    type="submit"
                                                    onClick={handlePrescribe}
                                                    disabled={
                                                        processingId ===
                                                        'PRESCRIBE'
                                                    }
                                                >
                                                    {processingId ===
                                                    'PRESCRIBE'
                                                        ? 'Prescribing...'
                                                        : 'Confirm Prescription'}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {activeView === 'meds' ? (
                    <div className="p-8">
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
                                    onDismiss={() => {
                                        setDismissedAlertIds(prev => {
                                            const next = new Set(prev)
                                            next.add(alert.id)
                                            return next
                                        })
                                        setAlerts(prev =>
                                            prev.filter(a => a.id !== alert.id),
                                        )
                                    }}
                                />
                            ))}
                        <MedicationList meds={meds} />
                    </div>
                ) : (
                    <div className="p-8">
                        <ConditionList conditions={conditions} />
                    </div>
                )}
            </div>
        </div>
    )
}
