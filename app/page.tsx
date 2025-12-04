'use client';

import { useSmart } from './context/SmartContext';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MedicationRequest, BundleEntry, Coding } from 'fhir/r4';
import MedicationList, { MappedMedicationRequest } from '@/components/MedicationList';



export default function DashboardPage() {
  const { patient, medsBundle, error, loading } = useSmart();
  const [meds, setMeds] = useState<MappedMedicationRequest[]>([])

  useEffect(() => {
    if (medsBundle?.entry) {
      const mappedMeds = medsBundle.entry.map((entry: BundleEntry) => {
        const res = entry.resource as MedicationRequest;
        
        // Extract RxNorm Code (if available) for later use
        const coding = res.medicationCodeableConcept?.coding?.find(
          (c: Coding) => c.system === "http://www.nlm.nih.gov/research/umls/rxnorm"
        );

        return {
          id: res.id,
          name: res.medicationCodeableConcept?.text || coding?.display || "Unknown Medication",
          prescriber: res.requester?.display || "Unknown Provider",
          status: res.status,
          date: res.authoredOn?.split('T')[0] || "N/A", // Format: YYYY-MM-DD
          dosage: res.dosageInstruction?.[0]?.text || "As directed",
          rxNormCode: coding?.code
        };
      });
      setMeds(mappedMeds);
    }
  }, [medsBundle]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-slate-500 font-medium">Loading Patient Context...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Connection Error</h2>
        <p className="text-slate-500 mb-8">
          {error}
        </p>
        <a 
          href="/launch" 
          className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
        >
          <RefreshCw className="h-5 w-5" />
          Relaunch App
        </a>
      </div>
    </div>
  );

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
                      {patient?.name?.[0]?.given?.[0]?.[0]}{patient?.name?.[0]?.family?.[0]}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold leading-tight">
                      {patient?.name?.[0]?.given?.join(' ')} {patient?.name?.[0]?.family}
                    </h2>
                    <p className="text-slate-400 text-sm">
                      DOB: {patient?.birthDate} • Sex: {patient?.gender} • ID: {patient?.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
      
        
        {/* SPRINT 3 PLACEHOLDER: ALERT SECTION WILL GO HERE */}
        
        {/* 4. MEDICATION LIST TABLE */}
        <MedicationList meds={meds} />

      </div>
    </div>
  );
}