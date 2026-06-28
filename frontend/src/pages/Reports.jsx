import { useApp } from '../context/AppContext';
import Topbar from '../components/Topbar';

const fmt = (n) => `Rs. ${Number(n || 0).toLocaleString('en-PK')}`;

// Group invoices by month
function groupByMonth(invoices) {
  const months = {};
  invoices.forEach(inv => {
    const month = inv.date.slice(0, 7); // YYYY-MM
    months[month] = (months[month] || 0) + inv.total;
  });
  return months;
}

// Group invoices by product category
function groupByCategory(invoices, products) {
  const cats = {};
  invoices.forEach(inv => {
    inv.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      const cat = prod?.category || 'Other';
      cats[cat] = (cats[cat] || 0) + item.total;
    });
  });
  return cats;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Reports() {
  const { invoices, customers, products } = useApp();

  const monthlyData = groupByMonth(invoices);
  const monthEntries = Object.entries(monthlyData).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  const maxMonthVal = Math.max(...monthEntries.map(([, v]) => v), 1);

  const catData = groupByCategory(invoices, products);
  const catEntries = Object.entries(catData).sort(([, a], [, b]) => b - a);
  const maxCatVal = Math.max(...catEntries.map(([, v]) => v), 1);

  const topCustomers = [...customers].sort((a, b) => b.totalBuy - a.totalBuy).slice(0, 5);

  const formatMonth = (ym) => {
    const [y, m] = ym.split('-');
    return `${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
  };

  const barColors = ['#6c63ff', '#14b8a6', '#22c55e', '#f59e0b', '#ef4444', '#8892a4'];

  return (
    <div className="flex-1 overflow-y-auto">
      <Topbar title="Reports" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Monthly Sales Bar Chart */}
          <div className="bg-[#161b27] rounded-xl border border-[#2a3248] p-5">
            <h3 className="text-[#e8eaf0] font-semibold mb-5">📊 Monthly Sales</h3>
            {monthEntries.length === 0 ? (
              <p className="text-[#8892a4] text-center py-8">No sales data available</p>
            ) : (
              <div className="flex items-end justify-between gap-2 h-48">
                {monthEntries.map(([month, val], i) => {
                  const pct = (val / maxMonthVal) * 100;
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="relative w-full flex flex-col items-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 text-xs text-[#e8eaf0] bg-[#1c2233] px-2 py-1 rounded whitespace-nowrap border border-[#2a3248] z-10">
                          {fmt(val)}
                        </span>
                        <div className="w-full flex items-end justify-center" style={{ height: '160px' }}>
                          <div
                            className="w-full max-w-[40px] rounded-t-md transition-all duration-500 hover:opacity-80"
                            style={{
                              height: `${Math.max(pct, 4)}%`,
                              backgroundColor: barColors[i % barColors.length],
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-[#8892a4] text-xs text-center">{formatMonth(month)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sales by Category */}
          <div className="bg-[#161b27] rounded-xl border border-[#2a3248] p-5">
            <h3 className="text-[#e8eaf0] font-semibold mb-5">🏷️ Sales by Category</h3>
            {catEntries.length === 0 ? (
              <p className="text-[#8892a4] text-center py-8">No category data available</p>
            ) : (
              <div className="space-y-4">
                {catEntries.map(([cat, val], i) => {
                  const pct = (val / maxCatVal) * 100;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-[#e8eaf0] font-medium">{cat}</span>
                        <span className="text-[#8892a4]">{fmt(val)}</span>
                      </div>
                      <div className="h-2.5 bg-[#2a3248] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: barColors[i % barColors.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-[#161b27] rounded-xl border border-[#2a3248] p-5">
          <h3 className="text-[#e8eaf0] font-semibold mb-4">🏆 Top Customers by Purchase</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a3248]">
                  {['Rank', 'Customer', 'Type', 'Total Purchase', 'Outstanding'].map(h => (
                    <th key={h} className="text-left text-[#8892a4] text-xs font-semibold uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c, i) => (
                  <tr key={c.id} className="border-b border-[#2a3248]/50 hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                        i === 1 ? 'bg-[#8892a4]/20 text-[#8892a4]' :
                        i === 2 ? 'bg-[#ef4444]/20 text-[#ef4444]' : 'bg-[#2a3248] text-[#8892a4]'
                      }`}>{i + 1}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[#e8eaf0] font-medium">{c.name}</p>
                      <p className="text-[#8892a4] text-xs">{c.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full text-xs px-2 py-0.5 ${c.type === 'wholesale' ? 'bg-[#6c63ff]/20 text-[#6c63ff]' : 'bg-[#14b8a6]/20 text-[#14b8a6]'}`}>
                        {c.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#22c55e] font-semibold">{fmt(c.totalBuy)}</td>
                    <td className="px-4 py-3">
                      <span className={c.balance > 0 ? 'text-[#f59e0b]' : 'text-[#8892a4]'}>{fmt(c.balance)}</span>
                    </td>
                  </tr>
                ))}
                {topCustomers.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-[#8892a4] py-8">No customer data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
