import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import Table from '../components/Table';

const fmt = (n) => `Rs. ${Number(n || 0).toLocaleString('en-PK')}`;

export default function Purchases() {
  const { purchases, vendors, addPurchase } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    vendorId: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    total: '',
    paid: '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const totalPurchased = purchases.reduce((s, p) => s + p.total, 0);
  const totalPaid = purchases.reduce((s, p) => s + p.paid, 0);
  const totalBalance = purchases.reduce((s, p) => s + p.balance, 0);

  const inputCls = "w-full bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:border-[#6c63ff] focus:outline-none transition-colors";
  const labelCls = "block text-[#8892a4] text-xs font-medium mb-1";

  const handleSubmit = (e) => {
    e.preventDefault();
    const total = Number(form.total);
    const paid = Number(form.paid || 0);
    const vendor = vendors.find(v => v.id == form.vendorId);
    if (!vendor) return alert('Select a vendor');
    addPurchase({
      date: form.date,
      vendorId: Number(form.vendorId),
      vendorName: vendor.name,
      description: form.description,
      total,
      paid,
      balance: Math.max(0, total - paid),
    });
    setForm({ vendorId: '', date: new Date().toISOString().split('T')[0], description: '', total: '', paid: '' });
    setShowAdd(false);
  };

  const rows = purchases.map(p => [
    <span className="text-[#6c63ff] font-medium">{p.poNo}</span>,
    p.date,
    p.vendorName,
    <span className="text-[#8892a4] text-xs max-w-[160px] block truncate">{p.description}</span>,
    <span className="font-semibold">{fmt(p.total)}</span>,
    <span className="text-[#22c55e]">{fmt(p.paid)}</span>,
    <span className={p.balance > 0 ? 'text-[#ef4444] font-semibold' : 'text-[#8892a4]'}>{fmt(p.balance)}</span>,
  ]);

  return (
    <div className="flex-1 overflow-y-auto">
      <Topbar
        title="Purchases"
        action={
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-[#6c63ff] hover:bg-[#7c75ff] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
            <span>+</span> New Purchase
          </button>
        }
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Purchased" value={fmt(totalPurchased)} sub={`${purchases.length} orders`} color="accent" icon="🛒" />
          <StatCard label="Amount Paid" value={fmt(totalPaid)} sub="To vendors" color="green" icon="✅" />
          <StatCard label="Balance Due" value={fmt(totalBalance)} sub="Pending payment" color="red" icon="⏳" />
        </div>

        <div className="bg-[#161b27] rounded-xl border border-[#2a3248]">
          <div className="p-4 border-b border-[#2a3248]">
            <h3 className="text-[#e8eaf0] font-semibold">All Purchase Orders</h3>
          </div>
          <Table
            headers={['PO #', 'Date', 'Vendor', 'Items', 'Total', 'Paid', 'Balance']}
            rows={rows}
            emptyMessage="No purchases recorded yet"
          />
        </div>
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="New Purchase Order">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Vendor *</label>
              <select className={inputCls} value={form.vendorId} onChange={e => set('vendorId', e.target.value)} required>
                <option value="">Select vendor...</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" className={inputCls} value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Items Description</label>
            <textarea className={inputCls} rows={2} value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Lawn Fabric 500m, Cotton Shirting 200m..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Total Amount (Rs.) *</label>
              <input type="number" className={inputCls} value={form.total} onChange={e => set('total', e.target.value)} placeholder="0" min="0" required />
            </div>
            <div>
              <label className={labelCls}>Amount Paid Now (Rs.)</label>
              <input type="number" className={inputCls} value={form.paid} onChange={e => set('paid', e.target.value)} placeholder="0" min="0" />
            </div>
          </div>
          {form.total && (
            <div className="bg-[#1c2233] rounded-lg p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#8892a4]">Balance to pay later:</span>
                <span className="text-[#ef4444] font-semibold">
                  {fmt(Math.max(0, Number(form.total) - Number(form.paid || 0)))}
                </span>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm border border-[#2a3248] text-[#8892a4] rounded-lg hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 text-sm bg-[#6c63ff] hover:bg-[#7c75ff] text-white rounded-lg font-medium transition-colors">Save Purchase</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
