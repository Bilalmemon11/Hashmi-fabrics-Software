import { useApp } from '../context/AppContext';
import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';

const fmt = (n) => `Rs. ${Number(n || 0).toLocaleString('en-PK')}`;

export default function Inventory() {
  const { products } = useApp();

  const totalProducts = products.length;
  const stockValueCost = products.reduce((s, p) => s + p.cost * p.stock, 0);
  const stockValueRetail = products.reduce((s, p) => s + p.price * p.stock, 0);

  const getStockStatus = (p) => {
    if (p.stock === 0) return { color: 'bg-[#ef4444]', label: 'Out of Stock', textColor: 'text-[#ef4444]' };
    if (p.stock <= p.reorderLevel) return { color: 'bg-[#f59e0b]', label: 'Low Stock', textColor: 'text-[#f59e0b]' };
    return { color: 'bg-[#22c55e]', label: 'In Stock', textColor: 'text-[#22c55e]' };
  };

  const getStockPct = (p) => {
    const max = Math.max(p.reorderLevel * 3, p.stock, 1);
    return Math.min((p.stock / max) * 100, 100);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Topbar title="Inventory" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Products" value={totalProducts} sub="Active SKUs" color="accent" icon="📦" />
          <StatCard label="Stock Value (Cost)" value={fmt(stockValueCost)} sub="At purchase price" color="teal" icon="🏭" />
          <StatCard label="Stock Value (Retail)" value={fmt(stockValueRetail)} sub="At selling price" color="green" icon="💎" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {products.map(p => {
            const status = getStockStatus(p);
            const pct = getStockPct(p);
            const stockValue = p.cost * p.stock;

            return (
              <div key={p.id} className="bg-[#161b27] rounded-xl border border-[#2a3248] p-5 hover:border-[#2a3248]/80 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-[#e8eaf0] font-semibold">{p.name}</h4>
                    <p className="text-[#8892a4] text-xs mt-0.5">{p.category} • {p.unit}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.textColor} ${status.color}/10`}>
                    {status.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="h-2 bg-[#2a3248] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${status.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-[#1c2233] rounded-lg p-2.5 text-center">
                    <p className="text-[#8892a4] mb-0.5">Current Stock</p>
                    <p className={`font-bold text-sm ${status.textColor}`}>{p.stock} {p.unit}</p>
                  </div>
                  <div className="bg-[#1c2233] rounded-lg p-2.5 text-center">
                    <p className="text-[#8892a4] mb-0.5">Reorder Point</p>
                    <p className="font-bold text-sm text-[#f59e0b]">{p.reorderLevel} {p.unit}</p>
                  </div>
                  <div className="bg-[#1c2233] rounded-lg p-2.5 text-center">
                    <p className="text-[#8892a4] mb-0.5">Stock Value</p>
                    <p className="font-bold text-sm text-[#14b8a6]">Rs. {Math.round(stockValue / 1000)}K</p>
                  </div>
                </div>
              </div>
            );
          })}
          {products.length === 0 && (
            <div className="col-span-2 text-center text-[#8892a4] py-16">
              <span className="text-4xl block mb-3">📦</span>
              No products in inventory
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
