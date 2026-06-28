import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';

const fmt = (n) => `Rs. ${Number(n || 0).toLocaleString('en-PK')}`;

export default function Vendors() {
  const { vendors, addVendor, payVendor } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [payModal, setPayModal] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [form, setForm] = useState({ name: '', city: '', phone: '' });

  const totalVendors = vendors.length;
  const totalPurchases = vendors.reduce((s, v) => s + v.totalPurchase, 0);
  const totalPayable = vendors.reduce((s, v) => s + v.balance, 0);

  const inputCls = "w-full bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:border-[#6c63ff] focus:outline-none transition-colors";
  const labelCls = "block text-[#8892a4] text-xs font-medium mb-1";

  const handleAddVendor = (e) => {
    e.preventDefault();
    if (!form.name) return;
    addVendor(form);
    setForm({ name: '', city: '', phone: '' });
    setShowAdd(false);
  };

  const handlePayVendor = () => {
    const amt = Number(payAmount);
    if (!amt || amt <= 0) return alert('Enter valid amount');
    payVendor(payModal.id, amt, payDate);
    setPayModal(null);
    setPayAmount('');
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Topbar
        title="Vendors"
        action={
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-[#6c63ff] hover:bg-[#7c75ff] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
            <span>+</span> Add Vendor
          </button>
        }
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Vendors" value={totalVendors} sub="Suppliers" color="accent" icon="🏪" />
          <StatCard label="Total Purchases" value={fmt(totalPurchases)} sub="All time" color="teal" icon="🛒" />
          <StatCard label="Total Payable" value={fmt(totalPayable)} sub="Amount owed" color="red" icon="💳" />
        </div>

        <div className="bg-[#161b27] rounded-xl border border-[#2a3248]">
          <div className="p-4 border-b border-[#2a3248]">
            <h3 className="text-[#e8eaf0] font-semibold">All Vendors</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a3248]">
                  {['Vendor Name', 'City', 'Phone', 'Total Purchase', 'Balance (Baaki)', 'Action'].map(h => (
                    <th key={h} className="text-left text-[#8892a4] text-xs font-semibold uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendors.map(v => (
                  <tr key={v.id} className="border-b border-[#2a3248]/50 hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#14b8a6]/20 flex items-center justify-center text-[#14b8a6] text-xs font-bold flex-shrink-0">
                          {v.name.charAt(0)}
                        </div>
                        <p className="text-[#e8eaf0] font-medium">{v.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#8892a4]">{v.city}</td>
                    <td className="px-4 py-3 text-[#8892a4]">{v.phone}</td>
                    <td className="px-4 py-3 text-[#e8eaf0] font-medium">{fmt(v.totalPurchase)}</td>
                    <td className="px-4 py-3">
                      <span className={v.balance > 0 ? 'text-[#ef4444] font-semibold' : 'text-[#22c55e] font-medium'}>
                        {v.balance > 0 ? fmt(v.balance) : '✅ Clear'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {v.balance > 0 && (
                        <button
                          onClick={() => { setPayModal(v); setPayAmount(''); setPayDate(new Date().toISOString().split('T')[0]); }}
                          className="text-xs text-[#6c63ff] border border-[#6c63ff]/30 px-2 py-1 rounded-lg hover:bg-[#6c63ff]/10 transition-all font-medium"
                        >
                          Pay Vendor
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {vendors.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-[#8892a4] py-12">No vendors added yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Vendor Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Vendor">
        <form onSubmit={handleAddVendor} className="space-y-4">
          <div>
            <label className={labelCls}>Vendor Name *</label>
            <input className={inputCls} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Al-Hamd Fabrics" required />
          </div>
          <div>
            <label className={labelCls}>City</label>
            <input className={inputCls} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="e.g. Faisalabad" />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input className={inputCls} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="041-1234567" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm border border-[#2a3248] text-[#8892a4] rounded-lg hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 text-sm bg-[#6c63ff] hover:bg-[#7c75ff] text-white rounded-lg font-medium transition-colors">Add Vendor</button>
          </div>
        </form>
      </Modal>

      {/* Pay Vendor Modal */}
      <Modal isOpen={!!payModal} onClose={() => setPayModal(null)} title="Pay Vendor" size="sm">
        {payModal && (
          <div className="space-y-4">
            <div className="bg-[#1c2233] rounded-lg p-4">
              <p className="text-[#8892a4] text-xs mb-1">Vendor</p>
              <p className="text-[#e8eaf0] font-semibold">{payModal.name}</p>
              <p className="text-[#ef4444] text-sm mt-1">Outstanding: {fmt(payModal.balance)}</p>
            </div>
            <div>
              <label className={labelCls}>Payment Date</label>
              <input type="date" className={inputCls} value={payDate} onChange={e => setPayDate(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Amount (Rs.) *</label>
              <input
                type="number"
                className={inputCls}
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                max={payModal.balance}
                min="1"
                placeholder="Enter amount..."
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setPayModal(null)} className="px-4 py-2 text-sm border border-[#2a3248] text-[#8892a4] rounded-lg hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handlePayVendor} className="px-6 py-2 text-sm bg-[#6c63ff] hover:bg-[#7c75ff] text-white rounded-lg font-medium transition-colors">Confirm Payment</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
