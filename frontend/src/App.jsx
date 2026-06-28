import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Vendors from './pages/Vendors';
import Purchases from './pages/Purchases';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import ProfitLoss from './pages/ProfitLoss';

function AppShell() {
  const { loading, error } = useApp();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-[#6c63ff] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#8892a4] text-sm">Connecting to server...</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="bg-[#ef4444]/10 border-b border-[#ef4444]/30 text-[#ef4444] text-xs text-center py-2 px-4">
          {error} — Make sure backend is running: <code className="text-[#e8eaf0]">php artisan serve</code>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/products" element={<Products />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profit-loss" element={<ProfitLoss />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="flex min-h-screen bg-[#0f1117]">
          <Sidebar />
          <main className="flex-1 flex flex-col overflow-hidden">
            <AppShell />
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
