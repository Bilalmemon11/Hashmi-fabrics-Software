import { useState, useEffect } from 'react';
import api from '../services/api';
import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';

const fmt = (n) => `Rs. ${Number(n || 0).toLocaleString('en-PK')}`;

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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/profit-loss')
      .then((res) => setData(res.data.data))
      .catch(() => alert('Could not load profit & loss report'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-[#8892a4] text-sm animate-pulse">Loading report...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[#ef4444] text-sm">Failed to load report</p>
      </div>
    );
  }

  const revenue = Number(data.total_revenue);
  const cogs = Number(data.total_cogs);
  const grossProfit = Number(data.gross_profit);
  const totalExpenses = Number(data.total_expenses);
  const netProfit = Number(data.net_profit);
  const grossMargin = Number(data.gross_margin_pct);
  const netMargin = Number(data.net_margin_pct);
  const expenseRatio = Number(data.expense_ratio_pct);
  const cogsRatio = Number(data.cogs_ratio_pct);
  const weekly = data.weekly_avg || {};

  const expByCategory = {};
  EXPENSE_CATS.forEach((cat) => { expByCategory[cat] = 0; });
  (data.expense_breakdown || []).forEach((row) => {
    expByCategory[row.category] = Number(row.total);
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <Topbar title="Profit & Loss" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Revenue" value={fmt(revenue)} sub="Total sales" color="accent" icon="📈" />
          <StatCard label="Gross Profit" value={fmt(grossProfit)} sub={`Margin: ${grossMargin}%`} color={grossProfit >= 0 ? 'green' : 'red'} icon="💹" />
          <StatCard label="Total Expenses" value={fmt(totalExpenses)} sub="All categories" color="amber" icon="💸" />
          <StatCard label="Net Profit" value={fmt(netProfit)} sub={`Margin: ${netMargin}%`} color={netProfit >= 0 ? 'green' : 'red'} icon="🏆" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-[#161b27] rounded-xl border border-[#2a3248] p-5">
            <h3 className="text-[#e8eaf0] font-semibold mb-5">📋 Income Statement</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-[#2a3248]/50">
                <span className="text-[#8892a4]">Revenue (Sales)</span>
                <span className="text-[#e8eaf0] font-semibold">{fmt(revenue)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#2a3248]/50">
                <span className="text-[#8892a4]">Cost of Goods Sold</span>
                <span className="text-[#ef4444]">- {fmt(cogs)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#2a3248] font-semibold">
                <span className="text-[#e8eaf0]">Gross Profit</span>
                <span className={grossProfit >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>{fmt(grossProfit)}</span>
              </div>
              {EXPENSE_CATS.filter((cat) => expByCategory[cat] > 0).map((cat) => (
                <div key={cat} className="flex justify-between py-1.5 pl-4">
                  <span className="text-[#8892a4] text-xs">{cat}</span>
                  <span className="text-[#ef4444] text-xs">- {fmt(expByCategory[cat])}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 border-t border-[#2a3248] font-semibold">
                <span className="text-[#e8eaf0]">Total Expenses</span>
                <span className="text-[#ef4444]">- {fmt(totalExpenses)}</span>
              </div>
              <div className={`flex justify-between py-4 px-4 rounded-xl mt-2 ${netProfit >= 0 ? 'bg-[#22c55e]/10 border border-[#22c55e]/20' : 'bg-[#ef4444]/10 border border-[#ef4444]/20'}`}>
                <span className={`font-bold ${netProfit >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                  {netProfit >= 0 ? 'Net Profit' : 'Net Loss'}
                </span>
                <span className={`font-bold text-lg ${netProfit >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                  {fmt(Math.abs(netProfit))}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#161b27] rounded-xl border border-[#2a3248] p-5">
            <h3 className="text-[#e8eaf0] font-semibold mb-5">📊 Margin Analysis</h3>
            <div className="space-y-5">
              <MarginBar label="Gross Margin" value={grossMargin} color="green" />
              <MarginBar label="Net Margin" value={netMargin} color={netMargin >= 0 ? 'accent' : 'red'} />
              <MarginBar label="Expense Ratio" value={expenseRatio} color="amber" />
              <MarginBar label="COGS Ratio" value={cogsRatio} color="teal" />
            </div>
            <div className="mt-6 bg-[#1c2233] rounded-xl p-4 border border-[#2a3248]">
              <p className="text-[#8892a4] text-xs font-semibold uppercase tracking-wider mb-3">Weekly Average</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-[#8892a4]">Revenue</span><p className="text-[#e8eaf0] font-semibold">{fmt(weekly.revenue)}</p></div>
                <div><span className="text-[#8892a4]">Expenses</span><p className="text-[#ef4444] font-semibold">{fmt(weekly.expenses)}</p></div>
                <div><span className="text-[#8892a4]">Gross Profit</span><p className="text-[#22c55e] font-semibold">{fmt(weekly.gross_profit)}</p></div>
                <div><span className="text-[#8892a4]">Net Profit</span><p className={`font-semibold ${Number(weekly.net_profit) >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>{fmt(weekly.net_profit)}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
