import { useState } from 'react'
import { useCustomers } from '@/hooks/useCustomers'
import { Customer } from '@/api/customerApi'
import { CustomerSearch } from './components/CustomerSearch'
import { CustomerTable } from './components/CustomerTable'
import { CustomerSheet } from './components/CustomerSheet'
import { CustomerOrdersSheet } from './components/CustomerOrdersSheet'

export default function Customers() {
  const {
    mode, switchMode,
    simple, updateSimple, clearSimple,
    chips, updateChip, removeChip, addChip, reorderChips,
    availableToAdd,
    page, setPage,
    perPage, setPerPage,
    data, loading,
  } = useCustomers()

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const [ordersCustomer, setOrdersCustomer] = useState<Customer | null>(null)
  const [ordersOpen, setOrdersOpen] = useState(false)

  function handleRowClick(customer: Customer) {
    setSelectedCustomer(customer)
    setDetailOpen(true)
  }

  function handleOrdersClick(customer: Customer) {
    setOrdersCustomer(customer)
    setOrdersOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-2xl mx-auto px-6 py-8 space-y-5">
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>

        <CustomerSearch
          mode={mode}
          onSwitchMode={switchMode}
          simple={simple}
          onUpdateSimple={updateSimple}
          onClearSimple={clearSimple}
          chips={chips}
          onUpdateChip={updateChip}
          onRemoveChip={removeChip}
          onAddChip={addChip}
          onReorderChips={reorderChips}
          availableToAdd={availableToAdd}
        />

        <CustomerTable
          data={data?.data ?? []}
          meta={data?.meta ?? null}
          loading={loading}
          selectedId={selectedCustomer?.id ?? null}
          onRowClick={handleRowClick}
          onOrdersClick={handleOrdersClick}
          page={page}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      </div>

      <CustomerSheet
        customer={selectedCustomer}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />

      <CustomerOrdersSheet
        customer={ordersCustomer}
        open={ordersOpen}
        onClose={() => setOrdersOpen(false)}
      />
    </div>
  )
}
