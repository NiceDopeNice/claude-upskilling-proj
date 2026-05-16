import { useState } from 'react'
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Plus,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ─── Static mock data ──────────────────────────────────────────────────────

const MOCK_CUSTOMERS = [
  { id: 1, customer_no: 12345, first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com', pers_nr: '19900101-1234', tel: '070-123 45 67', adress: 'Main Street 1', ort: 'Stockholm', last_order_date: '2024-03-15' },
  { id: 2, customer_no: 12346, first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com', pers_nr: '19850515-5678', tel: '070-234 56 78', adress: 'Oak Avenue 2', ort: 'Gothenburg', last_order_date: null },
  { id: 3, customer_no: 12347, first_name: 'Erik', last_name: 'Johansson', email: 'erik.j@example.com', pers_nr: '19780320-9012', tel: '070-345 67 89', adress: 'Birch Lane 5', ort: 'Malmö', last_order_date: '2024-01-22' },
  { id: 4, customer_no: 12348, first_name: 'Anna', last_name: 'Lindqvist', email: 'anna.l@example.com', pers_nr: '19920808-3456', tel: '070-456 78 90', adress: 'Pine Road 8', ort: 'Uppsala', last_order_date: '2023-11-05' },
  { id: 5, customer_no: 12349, first_name: 'Lars', last_name: 'Bergström', email: 'lars.b@example.com', pers_nr: '19670430-7890', tel: '070-567 89 01', adress: 'Elm Street 12', ort: 'Stockholm', last_order_date: '2024-02-28' },
  { id: 6, customer_no: 12350, first_name: 'Maria', last_name: 'Karlsson', email: 'maria.k@example.com', pers_nr: '19881212-2345', tel: '070-678 90 12', adress: 'Cedar Blvd 3', ort: 'Linköping', last_order_date: '2023-09-14' },
]

const MOCK_DETAIL = {
  id: 1, customer_no: 12345, first_name: 'John', last_name: 'Doe',
  email: 'john.doe@example.com', alternative_email: null,
  tel: '070-123 45 67', pers_nr: '19900101-1234',
  adress: 'Main Street 1', ort: 'Stockholm', region_code: 'SE',
  ltv: 1250.50, order_count: 12, last_order_date: '2024-03-15',
  is_vip: true, blocked_fees: false, do_not_call: false,
  difficult_customer: false, block_email: false,
}

const SEARCH_FIELDS = [
  { label: 'Name', value: 'name' },
  { label: 'Customer No.', value: 'customer_no' },
  { label: 'Email', value: 'email' },
  { label: 'Phone', value: 'tel' },
  { label: 'SSN', value: 'pers_nr' },
]

const PLACEHOLDERS: Record<string, string> = {
  name: 'Search by name...',
  customer_no: 'Search by customer no...',
  email: 'Search by email...',
  tel: 'Search by phone...',
  pers_nr: 'Search by SSN...',
}

const MULTI_FILTERS = [
  { key: 'customer_no', label: 'Customer No.', defaultActive: true },
  { key: 'pers_nr', label: 'SSN', defaultActive: true },
  { key: 'name', label: 'Name', defaultActive: true },
  { key: 'tel', label: 'Phone', defaultActive: true },
  { key: 'email', label: 'Email', defaultActive: true },
  { key: 'adress', label: 'Address', defaultActive: false },
  { key: 'alternative_email', label: 'Alt. Email', defaultActive: false },
]

// ─── Sub-components ────────────────────────────────────────────────────────

function FlagRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Badge variant={value ? 'destructive' : 'secondary'} className="text-xs">
        {value ? 'Yes' : 'No'}
      </Badge>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="flex items-start justify-between py-1.5">
      <span className="text-sm text-muted-foreground w-32 shrink-0">{label}</span>
      <span className="text-sm text-right">{value ?? '—'}</span>
    </div>
  )
}

// ─── Main Mockup ───────────────────────────────────────────────────────────

export default function CustomersMockup() {
  const [mode, setMode] = useState<'simple' | 'multi'>('simple')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchField, setSearchField] = useState('name')
  const [activeFilters, setActiveFilters] = useState<string[]>(
    MULTI_FILTERS.filter(f => f.defaultActive).map(f => f.key)
  )
  const [chipValues, setChipValues] = useState<Record<string, string>>({})
  const [selectedCustomer, setSelectedCustomer] = useState<typeof MOCK_DETAIL | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [perPage, setPerPage] = useState('50')

  const isSearchActive = searchTerm.trim() !== '' && searchField !== ''
  const fieldLabel = SEARCH_FIELDS.find(f => f.value === searchField)?.label ?? ''
  const inactiveFilters = MULTI_FILTERS.filter(f => !activeFilters.includes(f.key))

  const handleRowClick = (customer: typeof MOCK_CUSTOMERS[0]) => {
    setLoading(true)
    setSelectedCustomer(null)
    setSheetOpen(true)
    // Simulate API call
    setTimeout(() => {
      setSelectedCustomer({ ...MOCK_DETAIL, ...customer })
      setLoading(false)
    }, 600)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setSearchField('name')
  }

  const removeFilter = (key: string) => {
    setActiveFilters(prev => prev.filter(k => k !== key))
    setChipValues(prev => { const next = { ...prev }; delete next[key]; return next })
  }

  const addFilter = (key: string) => {
    setActiveFilters(prev => [...prev, key])
  }

  return (
    <TooltipProvider>
      <div className="p-6 space-y-4 max-w-7xl mx-auto">

        {/* Page Header */}
        <h1 className="text-2xl font-semibold">Customers</h1>

        {/* ── Search Bar ── */}
        <div className="space-y-2">

          {/* Simple Mode */}
          {mode === 'simple' && (
            <div className="flex items-center gap-2">
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {SEARCH_FIELDS.map(f => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder={PLACEHOLDERS[searchField]}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => setMode('multi')}>
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Switch to advanced search</TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Active filter badge */}
          {mode === 'simple' && isSearchActive && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1 pr-1">
                <span>"{searchTerm}" in {fieldLabel}</span>
                <button onClick={handleClearSearch} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}

          {/* No field selected warning */}
          {mode === 'simple' && searchTerm && !searchField && (
            <p className="text-xs text-amber-600">⚠ Please select a search field</p>
          )}

          {/* Multi Mode */}
          {mode === 'multi' && (
            <div className="flex flex-wrap items-center gap-2 border rounded-lg p-3 bg-muted/30">
              {activeFilters.map(key => {
                const filter = MULTI_FILTERS.find(f => f.key === key)!
                return (
                  <div key={key} className="flex items-center gap-1.5 bg-background border rounded-md px-2 py-1">
                    <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab" />
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{filter.label}</span>
                    <Input
                      className="h-6 w-28 text-xs px-1.5"
                      value={chipValues[key] ?? ''}
                      onChange={e => setChipValues(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder="..."
                    />
                    <button onClick={() => removeFilter(key)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )
              })}

              {/* Add filter */}
              {inactiveFilters.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                      <Plus className="h-3 w-3" />
                      Add filter
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {inactiveFilters.map(f => (
                      <DropdownMenuItem key={f.key} onClick={() => addFilter(f.key)}>
                        {f.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Toggle back to simple */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8 ml-auto" onClick={() => setMode('simple')}>
                    <Search className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Switch to simple search</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {/* ── Table ── */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-24">Customer #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>SSN</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Last Order</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_CUSTOMERS.map(customer => (
                <TableRow
                  key={customer.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(customer)}
                >
                  <TableCell className="font-medium text-sm">{customer.customer_no}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{customer.first_name} {customer.last_name}</div>
                    <div className="text-xs text-muted-foreground">{customer.email}</div>
                  </TableCell>
                  <TableCell className="text-sm">{customer.pers_nr}</TableCell>
                  <TableCell className="text-sm">{customer.tel}</TableCell>
                  <TableCell className="text-sm">{customer.adress}</TableCell>
                  <TableCell className="text-sm">{customer.ort}</TableCell>
                  <TableCell className="text-sm">
                    {customer.last_order_date ?? <span className="text-muted-foreground">N/A</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination ── */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing 1 – {perPage} of 1,234 customers</span>
          <div className="flex items-center gap-3">
            <Select value={perPage} onValueChange={setPerPage}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['50', '100', '200', '500'].map(n => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {[1, 2, 3].map(p => (
                <Button key={p} variant={p === 1 ? 'default' : 'outline'} size="icon" className="h-8 w-8 text-xs">
                  {p}
                </Button>
              ))}
              <span className="px-1">...</span>
              <Button variant="outline" size="icon" className="h-8 w-8 text-xs">25</Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* ── Details Sheet ── */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="w-96 overflow-y-auto">
            {loading ? (
              <div className="space-y-4 pt-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-24" />
                <Separator />
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            ) : selectedCustomer ? (
              <>
                <SheetHeader className="pb-4">
                  <SheetTitle className="text-lg">
                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                    {selectedCustomer.is_vip && (
                      <Badge className="ml-2 text-xs" variant="secondary">VIP</Badge>
                    )}
                  </SheetTitle>
                  <p className="text-sm text-muted-foreground">Customer #{selectedCustomer.customer_no}</p>
                </SheetHeader>

                <Separator />

                {/* Contact */}
                <div className="py-4 space-y-1">
                  <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-2">Contact</p>
                  <DetailRow label="Email" value={selectedCustomer.email} />
                  <DetailRow label="Alt. Email" value={selectedCustomer.alternative_email} />
                  <DetailRow label="Phone" value={selectedCustomer.tel} />
                  <DetailRow label="SSN" value={selectedCustomer.pers_nr} />
                </div>

                <Separator />

                {/* Address */}
                <div className="py-4 space-y-1">
                  <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-2">Address</p>
                  <DetailRow label="Street" value={selectedCustomer.adress} />
                  <DetailRow label="City" value={selectedCustomer.ort} />
                  <DetailRow label="Region" value={selectedCustomer.region_code} />
                </div>

                <Separator />

                {/* Stats */}
                <div className="py-4 space-y-1">
                  <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-2">Stats</p>
                  <DetailRow label="LTV" value={`${selectedCustomer.ltv.toLocaleString()} SEK`} />
                  <DetailRow label="Orders" value={selectedCustomer.order_count} />
                  <DetailRow label="Last Order" value={selectedCustomer.last_order_date} />
                </div>

                <Separator />

                {/* Flags */}
                <div className="py-4 space-y-1">
                  <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-2">Flags</p>
                  <FlagRow label="VIP" value={selectedCustomer.is_vip} />
                  <FlagRow label="Blocked Fees" value={selectedCustomer.blocked_fees} />
                  <FlagRow label="Do Not Call" value={selectedCustomer.do_not_call} />
                  <FlagRow label="Difficult Customer" value={selectedCustomer.difficult_customer} />
                  <FlagRow label="Block Email" value={selectedCustomer.block_email} />
                </div>
              </>
            ) : null}
          </SheetContent>
        </Sheet>

      </div>
    </TooltipProvider>
  )
}
