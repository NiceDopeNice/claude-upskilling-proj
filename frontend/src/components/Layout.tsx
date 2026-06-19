import { useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import {
  Users, ChevronLeft, ChevronRight, LayoutDashboard,
  Bell, Settings, LogOut, Menu, X, ShieldAlert, List, ShieldX,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

/* ── Breadcrumbs ── */

type Crumb = { label: string; path: string; current?: boolean }

function useBreadcrumbs(): Crumb[] {
  const { pathname } = useLocation()

  if (pathname === '/') return [{ label: 'Dashboard', path: '/', current: true }]

  if (pathname === '/customers')
    return [
      { label: 'Dashboard', path: '/' },
      { label: 'Customers', path: '/customers', current: true },
    ]

  if (pathname === '/customers/blocked-ssn')
    return [
      { label: 'Dashboard', path: '/' },
      { label: 'Customers', path: '/customers' },
      { label: 'Blocked SSN', path: '/customers/blocked-ssn', current: true },
    ]

  if (pathname.startsWith('/customers/'))
    return [
      { label: 'Dashboard', path: '/' },
      { label: 'Customers', path: '/customers' },
      { label: 'Customer Detail', path: pathname, current: true },
    ]

  if (pathname === '/gdpr')
    return [
      { label: 'Dashboard', path: '/' },
      { label: 'Customers', path: '/customers' },
      { label: 'GDPR', path: '/gdpr', current: true },
    ]

  if (pathname.startsWith('/orders/'))
    return [
      { label: 'Dashboard', path: '/' },
      { label: 'Order Detail', path: pathname, current: true },
    ]

  if (pathname.startsWith('/subscriptions/'))
    return [
      { label: 'Dashboard', path: '/' },
      { label: 'Subscription Detail', path: pathname, current: true },
    ]

  return [{ label: 'Dashboard', path: '/', current: true }]
}

function Breadcrumbs() {
  const crumbs = useBreadcrumbs()
  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1 text-[11px] min-w-0">
      {crumbs.map((crumb, i) => (
        <span key={crumb.path} className="flex items-center gap-1 min-w-0">
          {i > 0 && (
            <span className="text-muted-foreground/30 mx-0.5 text-sm font-light select-none leading-none">/</span>
          )}
          {crumb.current ? (
            <span className="font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md truncate">
              {crumb.label}
            </span>
          ) : (
            <Link
              to={crumb.path}
              className="text-muted-foreground hover:text-foreground transition-colors truncate"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}

/* ── Sidebar link ── */

function SidebarLink({
  to, icon: Icon, label, collapsed, exact, sub,
}: {
  to: string; icon: React.ElementType; label: string; collapsed: boolean; exact: boolean; sub?: boolean
}) {
  const location = useLocation()
  const active = exact ? location.pathname === to : location.pathname.startsWith(to)

  return (
    <NavLink
      to={to}
      className={`relative flex items-center gap-3 rounded-lg text-sm font-medium transition-all group
        ${sub && !collapsed ? 'pl-7 pr-3 py-2' : 'px-3 py-2'}
        ${active
          ? 'bg-[#00adef] text-white font-semibold shadow-sm'
          : 'text-foreground hover:bg-[#00adef] hover:text-white'
        }`}
      title={collapsed ? label : undefined}
    >
      <Icon className={`h-4 w-4 shrink-0`} />
      {!collapsed && <span className="truncate">{label}</span>}
      {collapsed && (
        <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-popover border border-border text-foreground text-xs shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
          {label}
        </span>
      )}
    </NavLink>
  )
}

/* ── Sidebar group ── */

function SidebarGroup({
  icon: Icon, label, collapsed, activePaths, children,
}: {
  icon: React.ElementType; label: string; collapsed: boolean; activePaths: string[]; children: React.ReactNode
}) {
  const location = useLocation()
  const isGroupActive = activePaths.some(p => location.pathname.startsWith(p))
  const [open, setOpen] = useState(true)
  const isExpanded = collapsed ? false : open

  return (
    <div>
      <button
        type="button"
        onClick={() => !collapsed && setOpen(o => !o)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative
          ${isGroupActive
            ? 'text-[#00adef] font-semibold'
            : 'text-foreground hover:bg-[#00adef] hover:text-white'
          }
          ${collapsed ? 'justify-center' : ''}
        `}
        title={collapsed ? label : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="truncate flex-1 text-left">{label}</span>
            <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
          </>
        )}
        {collapsed && (
          <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-popover border border-border text-foreground text-xs shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
            {label}
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="space-y-0.5 mt-0.5">
          {children}
        </div>
      )}
    </div>
  )
}

/* ── Layout ── */

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">

      {/* ── Top Header ── */}
      <header className="h-12 bg-[#00adef] sticky top-0 z-40 flex items-center px-5 gap-4 shrink-0 shadow-md">
        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-1.5 rounded-md text-white/80 hover:bg-white/15 transition-colors"
          onClick={() => setMobileOpen(prev => !prev)}
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2.5 select-none">
          <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
            <span className="text-[#00adef] text-sm font-black tracking-tight">S</span>
          </div>
          <div className={`flex flex-col leading-none transition-all duration-200 ${collapsed ? 'md:hidden' : ''}`}>
            <span className="text-white font-bold text-sm tracking-tight">SGB</span>
            <span className="text-white/60 text-[10px] font-medium tracking-widest uppercase">v3 Admin</span>
          </div>
        </div>

        <div className="flex-1" />

        {/* Header actions */}
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button className="p-2 rounded-lg text-white/80 hover:bg-white/15 transition-colors relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 ring-1 ring-[#00adef]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Notifications</TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button className="p-2 rounded-lg text-white/80 hover:bg-white/15 transition-colors">
              <Settings className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Settings</TooltipContent>
        </Tooltip>

        <div className="h-6 w-px bg-white/20" />

        {/* User avatar */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="h-8 w-8 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-[11px] font-bold text-white select-none shadow-sm">
            JD
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-xs font-semibold text-white">John</span>
            <span className="text-[10px] text-white/60">Admin</span>
          </div>
        </div>
      </header>

      {/* ── Breadcrumb bar ── */}
      <div className="h-10 border-b border-border bg-white flex items-center px-6 shrink-0">
        <Breadcrumbs />
      </div>

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
            flex-col border-r border-border bg-white shrink-0 transition-all duration-200 z-30
            fixed md:relative h-[calc(100vh-5.5rem)] md:h-auto top-[5.5rem] md:top-0
            ${mobileOpen ? 'flex w-56' : 'hidden md:flex'}
            ${collapsed ? 'md:w-16' : 'md:w-56'}
          `}
        >
          {/* Collapse toggle — top */}
          <div className="shrink-0 flex justify-end px-3 pt-3 pb-1">
            <button
              onClick={() => setCollapsed(prev => !prev)}
              className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-[#00adef] hover:text-white transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-3 pb-4 space-y-1 overflow-y-auto overflow-x-hidden">
            {!collapsed && (
              <div className="px-3 pb-2 pt-0.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Menu</span>
              </div>
            )}

            <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} exact={true} />

            {!collapsed && (
              <div className="px-3 pb-1 pt-4">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Customers</span>
              </div>
            )}

            <SidebarGroup icon={Users} label="Customers" collapsed={collapsed} activePaths={['/customers', '/gdpr']}>
              <SidebarLink to="/customers"             icon={List}        label="List"        collapsed={collapsed} exact={true}  sub />
              <SidebarLink to="/gdpr"                  icon={ShieldAlert} label="GDPR"        collapsed={collapsed} exact={false} sub />
              <SidebarLink to="/customers/blocked-ssn" icon={ShieldX}     label="Blocked SSN" collapsed={collapsed} exact={false} sub />
            </SidebarGroup>
          </nav>

          {/* Bottom: user + actions */}
          <div className="shrink-0 border-t border-border">
            {/* User profile strip */}
            {!collapsed && (
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
                <div className="h-8 w-8 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                  JD
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">John</div>
                  <div className="text-[10px] text-muted-foreground truncate">Administrator</div>
                </div>
              </div>
            )}

            <div className="px-3 py-3 space-y-1">
              <button
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:text-white hover:bg-destructive transition-colors group relative ${collapsed ? 'justify-center' : ''}`}
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

            </div>
          </div>
        </aside>

        {/* ── Main content + footer wrapper ── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
          <main className="flex-1">
            {children}
          </main>

          {/* ── Footer ── */}
          <footer className="border-t border-border bg-card/60 px-5 py-2.5 shrink-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground">
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
