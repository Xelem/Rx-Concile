'use client'

import { useEffect } from 'react'
import FHIR from 'fhirclient'

export default function LaunchPage() {
    const clientId = process.env.NEXT_PUBLIC_MELD_CLIENT_ID
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}`
    useEffect(() => {
        FHIR.oauth2.authorize({
            clientId,
            scope: 'launch online_access openid fhirUser patient/MedicationRequest.read patient/MedicationRequest.write patient/Condition.read',
            redirectUri,
        })
    }, [])

    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <h1 className="text-xl font-semibold text-slate-700">
                    Connecting to EHR...
                </h1>
                <p className="text-slate-500">
                    Initializing SMART on FHIR Handshake
                </p>
            </div>
        </div>
    )
}
