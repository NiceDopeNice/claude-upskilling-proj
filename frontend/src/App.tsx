import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { LoadingProvider } from '@/context/LoadingContext'
import Layout from '@/components/Layout'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import CustomerDetailPage from './pages/CustomerDetail'
import GdprPage from './pages/Gdpr'
import BlockedSsnPage from './pages/BlockedSsn'
import OrderDetailPage from './pages/Orders'
import SubscriptionDetailPage from './pages/SubscriptionDetail'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton visibleToasts={1} />
      <TooltipProvider>
        <LoadingProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:id" element={<CustomerDetailPage />} />
              <Route path="/gdpr" element={<GdprPage />} />
              <Route path="/customers/blocked-ssn" element={<BlockedSsnPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              <Route path="/subscriptions/:id" element={<SubscriptionDetailPage />} />
            </Routes>
          </Layout>
        </LoadingProvider>
      </TooltipProvider>
    </BrowserRouter>
  )
}
