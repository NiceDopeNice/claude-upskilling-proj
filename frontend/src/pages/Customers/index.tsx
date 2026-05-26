import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomers } from '@/hooks/useCustomers'
import { Customer } from '@/api/customerApi'
import { CustomerSearch } from './components/CustomerSearch'
import { CustomerTable } from './components/CustomerTable'
import { CustomerOrdersSheet } from './components/CustomerOrdersSheet'

export default function Customers() {
  const navigate = useNavigate()
  const {
    mode, switchMode,
    simple, updateSimple, clearSimple,
    chips, updateChip, removeChip, addChip, reorderChips,
    availableToAdd,
    trackView,
    hasSearch, isLastViewed, activeFilters,
    page, setPage,
    perPage, setPerPage,
    data, loading,
  } = useCustomers()

  const [ordersCustomer, setOrdersCustomer] = useState<Customer | null>(null)
  const [ordersOpen, setOrdersOpen] = useState(false)

  function handleRowClick(customer: Customer) {
    trackView(customer.id)
    navigate(`/customers/${customer.id}`)
  }

  function handleOrdersClick(customer: Customer) {
    setOrdersCustomer(customer)
    setOrdersOpen(true)
  }

  return (
    <div>
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
          selectedId={null}
          onRowClick={handleRowClick}
          onOrdersClick={handleOrdersClick}
          page={page}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
          hasSearch={hasSearch}
          isLastViewed={isLastViewed}
          mode={mode}
          searchTerm={mode === 'simple' ? simple.term : undefined}
          searchFields={mode === 'simple' ? simple.fields : undefined}
          activeFilters={mode === 'multi' ? activeFilters : undefined}
        />
      </div>

      <CustomerOrdersSheet
        customer={ordersCustomer}
        open={ordersOpen}
        onClose={() => setOrdersOpen(false)}
      />
    </div>
  )
}
