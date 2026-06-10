import { useApp } from '../context/AppContext';
import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';

const fmt = (n) => `Rs. ${Number(n || 0).toLocaleString('en-PK')}`;
const pct = (a, b) => b > 0 ? Math.round((a / b) * 100) : 0;

const EXPENSE_CATS = ['Rent', 'Salary', 'Electricity', 'Transport', 'Packing', 'Other'];

function MarginBar({ label, value, color }) {
  const clamp = Math.min(Math.max(value, 0), 100);
  const colorMap = {
    green: 'bg-[#22c55e]',
    accent: 'bg-[#6c63ff]',
    amber: 'bg-[#f59e0b]',
    red: 'bg-[#ef4444]',
    teal: 'bg-[#14b8a6]',
  };
  const textMap = {
    green: 'text-[#22c55e]',
    accent: 'text-[#6c63ff]',
    amber: 'text-[#f59e0b]',
    red: 'text-[#ef4444]',
    teal: 'text-[#14b8a6]',
  };
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-[#8892a4]">{label}</span>
        <span className={`font-bold ${textMap[color]}`}>{clamp}%</span>
      </div>
      <div className="h-2.5 bg-[#2a3248] rounded-full overflow-hidden">
        <div className={`h-full ${colorMap[color]} rounded-full transition-all duration-700`} style={{ width: `${clamp}%` }} />
      </div>
    </div>
  );
}

export default function ProfitLoss() {
  const { invoices, purchases, expenses } = useApp();

  // Revenue = total invoice amounts
  const revenue = invoices.reduce((s, i) => s + i.total, 0);

  // COGS = sum of (cost * qty) for all sold items
  // We'll approximate COGS from purchases paid amounts as a ratio, or use invoice cost data
  // Use purchase total as COGS proxy (what we paid for goods)
  const cogs = purchases.reduce((s, p) => s + p.total, 0);

  const grossProfit = revenue - cogs;

  // Expenses breakdown
  const expByCategory = EXPENSE_CATS.reduce((acc, cat) => {
    acc[cat] = expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
    return acc;
  }, {});
  const totalExpenses = Object.values(expByCategory).reduce((s, v) => s + v, 0);

  const netProfit = grossProfit - totalExpenses;

  const grossMargin = pct(grossProfit, revenue);
  const netMargin = pct(netProfit, revenue);
  const expenseRatio = pct(totalExpenses, revenue);
  const cogsRatio = pct(cogs, revenue);

  // Weekly average (last 4 invoices / 4 weeks)
  const weeksCount = 4;
  const weeklyAvgRevenue = Math.round(revenue / weeksCount);
  const weeklyAvgExpenses = Math.round(totalExpenses / weeksCount);
  const weeklyAvgProfit = Math.round(netProfit / weeksCount);

  return (
    <div className="flex-1 overflow-y-auto">
      <Topbar title="Profit & Loss" />
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Revenue" value={fmt(revenue)} sub="Total sales" color="accent" icon="📈" />
          <StatCard label="Gross Profit" value={fmt(grossProfit)} sub={`Margin: ${grossMargin}%`} color={grossProfit >= 0 ? 'green' : 'red'} icon="💹" />
          <StatCard label="Total Expenses" value={fmt(totalExpenses)} sub="All categories" color="amber" icon="💸" />
          <StatCard label="Net Profit" value={fmt(netProfit)} sub={netProfit >= 0 ? '🎉 Profitable!' : '⚠️ Net Loss'} color={netProfit >= 0 ? 'green' : 'red'} icon={netProfit >= 0 ? '✅' : '❌'} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Income Statement */}
          <div className="xl:col-span-2 bg-[#161b27] rounded-xl border border-[#2a3248] p-5">
            <h3 className="text-[#e8eaf0] font-semibold mb-5">📋 Income Statement</h3>

            {/* Revenue Section */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-[#6c63ff] rounded-full" />
                <h4 className="text-[#8892a4] text-xs font-semibold uppercase tracking-wider">Revenue</h4>
              </div>
              <div className="bg-[#1c2233] rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#e8eaf0]">Total Invoice Sales</span>
                  <span className="text-[#22c55e] font-semibold">{fmt(revenue)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-[#2a3248] pt-2 font-bold">
                  <span className="text-[#e8eaf0]">Total Revenue</span>
                  <span className="text-[#22c55e]">{fmt(revenue)}</span>
                </div>
              </div>
            </div>

            {/* COGS Section */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-[#ef4444] rounded-full" />
                <h4 className="text-[#8892a4] text-xs font-semibold uppercase tracking-wider">Cost of Goods Sold</h4>
              </div>
              <div className="bg-[#1c2233] rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#e8eaf0]">Total Purchases (Stock Bought)</span>
                  <span className="text-[#ef4444]">({fmt(cogs)})</span>
                </div>
                <div className="flex justify-between text-sm border-t border-[#2a3248] pt-2 font-bold">
                  <span className="text-[#e8eaf0]">Gross Profit</span>
                  <span className={grossProfit >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>{fmt(grossProfit)}</span>
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-[#f59e0b] rounded-full" />
                <h4 className="text-[#8892a4] text-xs font-semibold uppercase tracking-wider">Operating Expenses</h4>
              </div>
              <div className="bg-[#1c2233] rounded-lg p-4 space-y-2">
                {EXPENSE_CATS.filter(cat => expByCategory[cat] > 0).map(cat => (
                  <div key={cat} className="flex justify-between text-sm">
                    <span className="text-[#e8eaf0]">{cat}</span>
                    <span className="text-[#f59e0b]">({fmt(expByCategory[cat])})</span>
                  </div>
                ))}
                {totalExpenses === 0 && (
                  <p className="text-[#8892a4] text-sm">No expenses recorded</p>
                )}
                <div className="flex justify-between text-sm border-t border-[#2a3248] pt-2 font-bold">
                  <span className="text-[#e8eaf0]">Total Expenses</span>
                  <span className="text-[#f59e0b]">({fmt(totalExpenses)})</span>
                </div>
              </div>
            </div>

            {/* Net Profit Box */}
            <div className={`rounded-xl p-4 border-2 ${netProfit >= 0 ? 'bg-[#22c55e]/10 border-[#22c55e]/40' : 'bg-[#ef4444]/10 border-[#ef4444]/40'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8892a4] font-medium">Net {netProfit >= 0 ? 'Profit' : 'Loss'}</p>
                  <p className={`text-3xl font-bold mt-1 ${netProfit >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                    {netProfit >= 0 ? '' : '-'}{fmt(Math.abs(netProfit))}
                  </p>
                </div>
                <div className={`text-5xl ${netProfit >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                  {netProfit >= 0 ? '📈' : '📉'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Margin Analysis */}
            <div className="bg-[#161b27] rounded-xl border border-[#2a3248] p-5">
              <h3 className="text-[#e8eaf0] font-semibold mb-4">📐 Margin Analysis</h3>
              <div className="space-y-4">
                <MarginBar label="Gross Margin %" value={grossMargin} color="green" />
                <MarginBar label="Net Margin %" value={netMargin} color={netMargin >= 0 ? 'accent' : 'red'} />
                <MarginBar label="Expense Ratio %" value={expenseRatio} color="amber" />
                <MarginBar label="COGS Ratio %" value={cogsRatio} color="red" />
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="bg-[#161b27] rounded-xl border border-[#2a3248] p-5">
              <h3 className="text-[#e8eaf0] font-semibold mb-4">📅 Weekly Average</h3>
              <div className="space-y-3">
                {[
                  { label: 'Avg Weekly Revenue', val: weeklyAvgRevenue, color: 'text-[#6c63ff]' },
                  { label: 'Avg Weekly Expenses', val: weeklyAvgExpenses, color: 'text-[#f59e0b]' },
                  { label: 'Avg Weekly Profit', val: weeklyAvgProfit, color: weeklyAvgProfit >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="bg-[#1c2233] rounded-lg p-3 flex justify-between items-center">
                    <span className="text-[#8892a4] text-sm">{label}</span>
                    <span className={`font-bold text-sm ${color}`}>{fmt(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
