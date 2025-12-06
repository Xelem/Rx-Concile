import React from 'react'
import { PopoverContent } from './ui/popover'
import { User, Calendar, Fingerprint, Dna } from 'lucide-react'

interface ProfilePopoverProps {
    name: string
    dob: string
    sex: string
    userId: string
}

const ProfilePopover = ({ name, dob, sex, userId }: ProfilePopoverProps) => {
    return (
        <PopoverContent className="w-80 p-0 overflow-hidden border-slate-200 shadow-xl">
            <div className="bg-foreground p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <User className="w-32 h-32" />
                </div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                        <span>{name.charAt(0)}</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg leading-tight">
                            {name}
                        </h4>
                        <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mt-1">
                            Patient
                        </p>
                    </div>
                </div>
            </div>
            <div className="p-4 bg-white">
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium uppercase">
                                Date of Birth
                            </p>
                            <p className="font-medium text-slate-900">{dob}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                        <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                            <Dna className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium uppercase">
                                Sex
                            </p>
                            <p className="font-medium text-slate-900 capitalize">
                                {sex}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                            <Fingerprint className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium uppercase">
                                User ID
                            </p>
                            <p className="font-mono text-xs font-medium text-slate-900">
                                {userId}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PopoverContent>
    )
}

export default ProfilePopover
