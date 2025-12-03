'use client';

import { useEffect, useState } from 'react';
import FHIR from 'fhirclient';
import Client from 'fhirclient/lib/Client';

export default function DashboardPage() {
  const [client, setClient] = useState<Client | null>(null);
  const [patient, setPatient] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const fhirClient = await FHIR.oauth2.ready();
        setClient(fhirClient);
        console.log(client)
        const patientData = await fhirClient.patient.read();
        setPatient(patientData);
        console.log(patientData)
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Patient Context...</div>;
  if (error) return <div className="p-10 text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">RxConcile Dashboard</h1>
        {patient && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold">
              Current Patient: {patient.name?.[0]?.given?.join(' ')} {patient.name?.[0]?.family}
            </h2>
            <p className="text-slate-500">
              ID: {patient.id} | Gender: {patient.gender} | DOB: {patient.birthDate}
            </p>
          </div>
        )}
      </div>

      {/* Placeholder for the Design I created in the Mock file */}
      <div className="bg-white p-10 rounded-xl border border-dashed border-slate-300 text-center text-slate-400">
        Insert Medication List Component Here
      </div>
    </div>
  );
}