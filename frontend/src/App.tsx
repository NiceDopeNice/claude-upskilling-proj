import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import Customers from './pages/Customers'
import CustomerDetailPage from './pages/CustomerDetail'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <Routes>
          <Route path="/" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  )
}
