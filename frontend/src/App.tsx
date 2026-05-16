import { TooltipProvider } from '@/components/ui/tooltip'
import Customers from './pages/Customers'
import './App.css'

export default function App() {
  return (
    <TooltipProvider>
      <Customers />
    </TooltipProvider>
  )
}
