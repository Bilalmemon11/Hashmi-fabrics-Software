import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import Topbar from '../components/Topbar';

const fmt = (n) => `Rs. ${Number(n || 0).toLocaleString('en-PK')}`;

const expenseCategories = ['Rent', 'Salary', 'Electricity', 'Transport', 'Packing', 'Other'];

export default function Dashboard() {
  const { invoices, customers, vendors, expenses, products } = useApp();

  const today = new Date().toISOString().split('T')[0];

  const totalSales = invoices.reduce((s, i) => s + i.total, 0);
  const cashReceived = invoices.reduce((s, i) => s + i.paid, 0);
  const customerUdhar = customers.reduce((s, c) => s + c.balance, 0);
  const vendorPayable = vendors.reduce((s, v) => s + v.balance, 0);

  const todayInvoices = invoices.filter(i => i.date === today);
  const lowStock = products.filter(p => p.stock <= p.reorderLevel);

  // Monthly expenses breakdown
  const expenseByCategory = {};
  expenseCategories.forEach(cat => {
    expenseByCategory[cat] = expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
  });
  const totalExpenses = Object.values(expenseByCategory).reduce((s, v) => s + v, 0);

  return (
    <div className="flex-1 overflow-y-auto">
      <Topbar title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Sales" value={fmt(totalSales)} sub={`${invoices.length} invoices`} color="accent" icon="💰" />
          <StatCard label="Cash Received" value={fmt(cashReceived)} sub="All payments collected" color="green" icon="✅" />
          <StatCard label="Customer Udhar" value={fmt(customerUdhar)} sub="Total receivable" color="amber" icon="⏳" />
          <StatCard label="Vendor Payable" value={fmt(vendorPayable)} sub="Amount owed to vendors" color="red" icon="🏪" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Today's Invoices */}
          <div className="bg-[#161b27] rounded-xl border border-[#2a3248] p-5">
            <h3 className="text-[#e8eaf0] font-semibold mb-4 flex items-center gap-2">
              🧾 <span>Today's Invoices</span>
              <span className="ml-auto text-xs bg-[#6c63ff]/20 text-[#6c63ff] px-2 py-0.5 rounded-full">
                {todayInvoices.length}
              </span>
            </h3>
            {todayInvoices.length === 0 ? (
              <p className="text-[#8892a4] text-sm text-center py-6">No invoices today</p>
            ) : (
              <div className="space-y-3">
                {todayInvoices.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between p-3 bg-[#1c2233] rounded-lg">
                    <div>
                      <p className="text-[#e8eaf0] text-sm font-medium">{inv.invoiceNo}</p>
                      <p className="text-[#8892a4] text-xs">{inv.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#22c55e] text-sm font-semibold">{fmt(inv.total)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${inv.type === 'cash' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#f59e0b]/20 text-[#f59e0b]'}`}>
                        {inv.type === 'cash' ? 'Cash' : 'Udhar'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-[#161b27] rounded-xl border border-[#2a3248] p-5">
            <h3 className="text-[#e8eaf0] font-semibold mb-4 flex items-center gap-2">
              ⚠️ <span>Low Stock Alerts</span>
              <span className="ml-auto text-xs bg-[#ef4444]/20 text-[#ef4444] px-2 py-0.5 rounded-full">
                {lowStock.length}
              </span>
            </h3>
            {lowStock.length === 0 ? (
              <p className="text-[#22c55e] text-sm text-center py-6">✅ All stock levels are good!</p>
            ) : (
              <div className="space-y-3">
                {lowStock.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-[#1c2233] rounded-lg">
                    <div>
                      <p className="text-[#e8eaf0] text-sm font-medium">{p.name}</p>
                      <p className="text-[#8892a4] text-xs">{p.category}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${p.stock === 0 ? 'text-[#ef4444]' : 'text-[#f59e0b]'}`}>
                        {p.stock} {p.unit}
                      </p>
                      <p className="text-[#8892a4] text-xs">Min: {p.reorderLevel}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Monthly Expense Breakdown */}
          <div className="bg-[#161b27] rounded-xl border border-[#2a3248] p-5">
            <h3 className="text-[#e8eaf0] font-semibold mb-4 flex items-center gap-2">
              💸 <span>Expenses Breakdown</span>
            </h3>
            <div className="space-y-3">
              {expenseCategories.filter(cat => expenseByCategory[cat] > 0).map(cat => {
                const pct = totalExpenses > 0 ? (expenseByCategory[cat] / totalExpenses) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#8892a4]">{cat}</span>
                      <span className="text-[#e8eaf0]">{fmt(expenseByCategory[cat])}</span>
                    </div>
                    <div className="h-1.5 bg-[#2a3248] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#6c63ff] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {totalExpenses === 0 && (
                <p className="text-[#8892a4] text-sm text-center py-4">No expenses recorded</p>
              )}
              {totalExpenses > 0 && (
                <div className="pt-2 border-t border-[#2a3248] flex justify-between">
                  <span className="text-[#8892a4] text-xs font-medium">Total</span>
                  <span className="text-[#ef4444] text-xs font-bold">{fmt(totalExpenses)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Customer Udhar Table */}
          <div className="bg-[#161b27] rounded-xl border border-[#2a3248] p-5">
            <h3 className="text-[#e8eaf0] font-semibold mb-4">👥 Customer Udhar</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a3248]">
                    <th className="text-left text-[#8892a4] text-xs font-semibold uppercase tracking-wider pb-2">Customer</th>
                    <th className="text-right text-[#8892a4] text-xs font-semibold uppercase tracking-wider pb-2">Udhar</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.filter(c => c.balance > 0).map(c => (
                    <tr key={c.id} className="border-b border-[#2a3248]/40 hover:bg-white/[0.03]">
                      <td className="py-2.5">
                        <p className="text-[#e8eaf0] font-medium">{c.name}</p>
                        <p className="text-[#8892a4] text-xs">{c.phone}</p>
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="text-[#f59e0b] font-semibold">{fmt(c.balance)}</span>
                      </td>
                    </tr>
                  ))}
                  {customers.filter(c => c.balance > 0).length === 0 && (
                    <tr><td colSpan={2} className="text-center text-[#8892a4] py-6 text-sm">No outstanding balances</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vendor Payments Due */}
          <div className="bg-[#161b27] rounded-xl border border-[#2a3248] p-5">
            <h3 className="text-[#e8eaf0] font-semibold mb-4">🏪 Vendor Payments Due</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a3248]">
                    <th className="text-left text-[#8892a4] text-xs font-semibold uppercase tracking-wider pb-2">Vendor</th>
                    <th className="text-right text-[#8892a4] text-xs font-semibold uppercase tracking-wider pb-2">Payable</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.filter(v => v.balance > 0).map(v => (
                    <tr key={v.id} className="border-b border-[#2a3248]/40 hover:bg-white/[0.03]">
                      <td className="py-2.5">
                        <p className="text-[#e8eaf0] font-medium">{v.name}</p>
                        <p className="text-[#8892a4] text-xs">{v.city}</p>
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="text-[#ef4444] font-semibold">{fmt(v.balance)}</span>
                      </td>
                    </tr>
                  ))}
                  {vendors.filter(v => v.balance > 0).length === 0 && (
                    <tr><td colSpan={2} className="text-center text-[#22c55e] py-6 text-sm">✅ All vendors paid!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
