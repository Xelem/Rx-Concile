'use client'

import { Activity, User, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useSmart } from '@/app/context/SmartContext'
import { Popover, PopoverTrigger } from './ui/popover'
import ProfilePopover from './ProfilePopover'

const Navbar = () => {
    const { client, error, patient } = useSmart()
    const isSessionActive = !!client && !error

    const name =
        (patient?.name?.[0]?.given?.join(' ') || '') +
        ' ' +
        (patient?.name?.[0]?.family || '')
    const dob = patient?.birthDate || 'N/A'
    const sex = patient?.gender || 'N/A'
    const userId = patient?.id || 'N/A'

    return (
        <nav className="bg-white border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg">
                        <Activity className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-header font-bold text-xl tracking-tight text-slate-800">
                        RxConcile
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    {isSessionActive ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            SMART Session Active
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-200">
                            <AlertCircle className="h-3.5 w-3.5" />
                            SMART Session Inactive
                        </span>
                    )}
                    <Popover>
                        <PopoverTrigger>
                            <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">
                                <User className="h-5 w-5 text-slate-500" />
                            </div>
                        </PopoverTrigger>
                        <ProfilePopover
                            name={name.trim() || 'Guest User'}
                            dob={dob}
                            sex={sex}
                            userId={userId}
                        />
                    </Popover>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
