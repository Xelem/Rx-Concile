'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import FHIR from 'fhirclient';
import Client from 'fhirclient/lib/Client';

interface SmartContextType {
  client: Client | null;
  patient: any | null;
  error: string | null;
  loading: boolean;
}

const SmartContext = createContext<SmartContextType | undefined>(undefined);

export function SmartProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<Client | null>(null);
  const [patient, setPatient] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSmart = async () => {
      try {
        const fhirClient = await FHIR.oauth2.ready();
        setClient(fhirClient);
        
        const patientData = await fhirClient.patient.read();
        setPatient(patientData);
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
    <SmartContext.Provider value={{ client, patient, error, loading }}>
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
