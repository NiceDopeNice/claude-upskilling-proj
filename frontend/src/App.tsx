import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from '@/components/Layout'
import Customers from './pages/Customers'
import CustomerDetailPage from './pages/CustomerDetail'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Customers />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />
          </Routes>
        </Layout>
      </TooltipProvider>
    </BrowserRouter>
  )
}
