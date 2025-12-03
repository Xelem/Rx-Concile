import { Activity, User } from 'lucide-react'

const Navbar = () => {
  return (
    <nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">RxConcile</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
              SMART Session Active
            </span>
            <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-slate-500" />
            </div>
          </div>
        </div>
    </nav>
  )
}

export default Navbar