import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';

const fmt = (n) => `Rs. ${Number(n || 0).toLocaleString('en-PK')}`;

function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

const avatarColors = ['bg-[#6c63ff]', 'bg-[#14b8a6]', 'bg-[#f59e0b]', 'bg-[#ef4444]', 'bg-[#22c55e]'];

export default function Customers() {
  const { customers, addCustomer, receivePayment } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [payModal, setPayModal] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', type: 'retail' });

  const totalCustomers = customers.length;
  const totalSales = customers.reduce((s, c) => s + c.totalBuy, 0);
  const totalUdhar = customers.reduce((s, c) => s + c.balance, 0);

  const inputCls = "w-full bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:border-[#6c63ff] focus:outline-none transition-colors";
  const labelCls = "block text-[#8892a4] text-xs font-medium mb-1";

  const handleAddCustomer = (e) => {
    e.preventDefault();
    if (!form.name) return;
    addCustomer(form);
    setForm({ name: '', phone: '', type: 'retail' });
    setShowAdd(false);
  };

  const handleReceivePayment = () => {
    const amt = Number(payAmount);
    if (!amt || amt <= 0) return alert('Enter valid amount');
    receivePayment(payModal.id, amt);
    setPayModal(null);
    setPayAmount('');
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Topbar
        title="Customers"
        action={
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-[#6c63ff] hover:bg-[#7c75ff] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
            <span>+</span> Add Customer
          </button>
        }
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Customers" value={totalCustomers} sub="Registered clients" color="accent" icon="👥" />
          <StatCard label="Total Sales" value={fmt(totalSales)} sub="All time purchases" color="green" icon="💰" />
          <StatCard label="Total Udhar" value={fmt(totalUdhar)} sub="Outstanding receivable" color="amber" icon="⏳" />
        </div>

        <div className="bg-[#161b27] rounded-xl border border-[#2a3248]">
          <div className="p-4 border-b border-[#2a3248]">
            <h3 className="text-[#e8eaf0] font-semibold">All Customers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a3248]">
                  {['Customer', 'Phone', 'Type', 'Total Purchase', 'Udhar Balance', 'Action'].map(h => (
                    <th key={h} className="text-left text-[#8892a4] text-xs font-semibold uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map((c, idx) => (
                  <tr key={c.id} className="border-b border-[#2a3248]/50 hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {initials(c.name)}
                        </div>
                        <div>
                          <p className="text-[#e8eaf0] font-medium">{c.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#8892a4]">{c.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full text-xs px-2 py-0.5 ${c.type === 'wholesale' ? 'bg-[#6c63ff]/20 text-[#6c63ff]' : 'bg-[#14b8a6]/20 text-[#14b8a6]'}`}>
                        {c.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#e8eaf0] font-medium">{fmt(c.totalBuy)}</td>
                    <td className="px-4 py-3">
                      <span className={c.balance > 0 ? 'text-[#f59e0b] font-semibold' : 'text-[#22c55e]'}>
                        {fmt(c.balance)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {c.balance > 0 && (
                        <button
                          onClick={() => { setPayModal(c); setPayAmount(''); }}
                          className="text-xs text-[#22c55e] border border-[#22c55e]/30 px-2 py-1 rounded-lg hover:bg-[#22c55e]/10 transition-all font-medium"
                        >
                          Receive Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-[#8892a4] py-12">No customers yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Customer">
        <form onSubmit={handleAddCustomer} className="space-y-4">
          <div>
            <label className={labelCls}>Customer Name *</label>
            <input className={inputCls} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Fatima Boutique" required />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input className={inputCls} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="0300-1234567" />
          </div>
          <div>
            <label className={labelCls}>Customer Type</label>
            <select className={inputCls} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              <option value="retail">Retail</option>
              <option value="wholesale">Wholesale</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm border border-[#2a3248] text-[#8892a4] rounded-lg hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 text-sm bg-[#6c63ff] hover:bg-[#7c75ff] text-white rounded-lg font-medium transition-colors">Add Customer</button>
          </div>
        </form>
      </Modal>

      {/* Receive Payment Modal */}
      <Modal isOpen={!!payModal} onClose={() => setPayModal(null)} title="Receive Payment" size="sm">
        {payModal && (
          <div className="space-y-4">
            <div className="bg-[#1c2233] rounded-lg p-4">
              <p className="text-[#8892a4] text-xs mb-1">Customer</p>
              <p className="text-[#e8eaf0] font-semibold">{payModal.name}</p>
              <p className="text-[#f59e0b] text-sm mt-1">Outstanding: {fmt(payModal.balance)}</p>
            </div>
            <div>
              <label className={labelCls}>Amount to Receive (Rs.) *</label>
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
              <button onClick={handleReceivePayment} className="px-6 py-2 text-sm bg-[#22c55e] hover:bg-green-400 text-white rounded-lg font-medium transition-colors">Confirm Receipt</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
