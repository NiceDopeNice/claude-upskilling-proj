import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Users, ChevronLeft, ChevronRight, LayoutDashboard,
  Bell, Settings, LogOut, Menu, X,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/customers', icon: Users, label: 'Customers', exact: false },
]

function SidebarLink({
  to, icon: Icon, label, collapsed, exact,
}: {
  to: string; icon: React.ElementType; label: string; collapsed: boolean; exact: boolean
}) {
  const location = useLocation()
  const active = exact ? location.pathname === to : location.pathname.startsWith(to)

  return (
    <NavLink
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
      }`}
      title={collapsed ? label : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
      {collapsed && (
        <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-popover border border-border text-foreground text-xs shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
          {label}
        </span>
      )}
    </NavLink>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* ── Top Header ── */}
      <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40 flex items-center px-4 gap-3 shrink-0">
        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
          onClick={() => setMobileOpen(prev => !prev)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight select-none">
          <span className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-black">S</span>
          <span className={`transition-all duration-200 ${collapsed ? 'md:hidden' : ''}`}>SGB v3</span>
        </div>

        <div className="flex-1" />

        {/* Header actions */}
        <button className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>
        <button className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Settings className="h-4 w-4" />
        </button>

        <div className="h-6 w-px bg-border mx-1" />

        {/* User avatar */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary select-none">
            JD
          </div>
          <span className="text-sm font-medium hidden sm:block">John</span>
        </div>
      </header>

      {/* ── Body: sidebar + main ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`
            flex-col border-r border-border bg-card shrink-0 transition-all duration-200 z-30
            fixed md:relative h-[calc(100vh-3.5rem)] md:h-auto top-14 md:top-0
            ${mobileOpen ? 'flex w-64' : 'hidden md:flex'}
            ${collapsed ? 'md:w-16' : 'md:w-56'}
          `}
        >
          {/* Nav items */}
          <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
            {NAV_ITEMS.map(item => (
              <SidebarLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                collapsed={collapsed}
                exact={item.exact}
              />
            ))}
          </nav>

          {/* Bottom: logout + collapse toggle */}
          <div className="px-2 pb-3 space-y-0.5 border-t border-border pt-3">
            <button
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors group relative ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? 'Logout' : undefined}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Logout</span>}
              {collapsed && (
                <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-popover border border-border text-foreground text-xs shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  Logout
                </span>
              )}
            </button>

            {/* Collapse toggle (desktop only) */}
            <button
              onClick={() => setCollapsed(prev => !prev)}
              className="hidden md:flex w-full items-center gap-3 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed
                ? <ChevronRight className="h-4 w-4 mx-auto" />
                : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>
              }
            </button>
          </div>
        </aside>

        {/* ── Main content + footer wrapper ── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
          <main className="flex-1">
            {children}
          </main>

          {/* ── Footer ── */}
          <footer className="border-t border-border bg-card/60 px-6 py-3 shrink-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>© {new Date().getFullYear()} SGB v3. All rights reserved.</span>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                <a href="#" className="hover:text-foreground transition-colors">Support</a>
              </div>
            </div>
          </footer>
        </div>

      </div>
    </div>
  )
}
