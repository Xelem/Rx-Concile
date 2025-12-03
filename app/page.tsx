'use client';

import { useSmart } from './context/SmartContext';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const { patient, error, loading } = useSmart();

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
        <h1 className="text-3xl font-bold text-slate-900">RxConcile Dashboard</h1>
        {patient && (
          <div className="mt-4 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {patient.name?.[0]?.given?.join(' ')} {patient.name?.[0]?.family}
                </h2>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-slate-500">
                  <span>ID: <span className="font-medium text-slate-700">{patient.id}</span></span>
                  <span>Gender: <span className="font-medium text-slate-700 capitalize">{patient.gender}</span></span>
                  <span>DOB: <span className="font-medium text-slate-700">{patient.birthDate}</span></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Placeholder for the Design I created in the Mock file */}
      <div className="bg-white p-12 rounded-xl border-2 border-dashed border-slate-300 text-center">
        <div className="max-w-sm mx-auto">
          <p className="text-slate-400 font-medium">Medication List Component</p>
          <p className="text-sm text-slate-400 mt-1">Will be implemented in the next step</p>
        </div>
      </div>
    </div>
  );
}