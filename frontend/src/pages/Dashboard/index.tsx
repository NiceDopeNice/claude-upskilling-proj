import { LayoutDashboard } from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="px-5 py-5">
      <h1 className="text-base font-semibold tracking-tight mb-6">Dashboard</h1>

      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <LayoutDashboard className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-1">Dashboard not available</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          This section is under construction. Check back later.
        </p>
      </div>
    </div>
  )
}
