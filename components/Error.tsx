import { AlertCircle, RefreshCw } from 'lucide-react'
import React from 'react'

interface ErrorProps {
    error: string
}

const Error = ({ error }: ErrorProps) => {
    return (
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
    )
}

export default Error
