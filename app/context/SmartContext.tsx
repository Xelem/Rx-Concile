'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {Bundle, MedicationRequest, Patient} from 'fhir/r4';
import FHIR from 'fhirclient';
import Client from 'fhirclient/lib/Client';

interface SmartContextType {
  client: Client | null;
  patient: Patient | null;
  medsBundle: Bundle<MedicationRequest> | null;
  error: string | null;
  loading: boolean;
}

const SmartContext = createContext<SmartContextType | undefined>(undefined);

export function SmartProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<Client | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medsBundle, setMedsBundle] = useState<Bundle<MedicationRequest> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSmart = async () => {
      try {
        const fhirClient = await FHIR.oauth2.ready();
        setClient(fhirClient);
        
        const patientData = await fhirClient.patient.read();
        setPatient(patientData);

        const medsBundle: Bundle<MedicationRequest> = await fhirClient.request(`MedicationRequest?patient=${patientData.id}&status=active`);
        setMedsBundle(medsBundle);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to initialize SMART session.');
      } finally {
        setLoading(false);
      }
    };

    initSmart();
  }, []);

  return (
    <SmartContext.Provider value={{ client, patient, medsBundle, error, loading }}>
      {children}
    </SmartContext.Provider>
  );
}

export function useSmart() {
  const context = useContext(SmartContext);
  if (context === undefined) {
    throw new Error('useSmart must be used within a SmartProvider');
  }
  return context;
}
