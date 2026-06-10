import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import Table from '../components/Table';

const fmt = (n) => `Rs. ${Number(n || 0).toLocaleString('en-PK')}`;

function InvoiceModal({ isOpen, onClose }) {
  const { customers, products, addInvoice } = useApp();
  const [form, setForm] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    items: [{ productId: '', productName: '', qty: 1, price: 0, total: 0 }],
    discount: 0,
    paid: 0,
    type: 'cash',
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const setItem = (idx, key, val) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [key]: val };
    if (key === 'productId') {
      const prod = products.find(p => p.id === val);
      if (prod) {
        items[idx].productName = prod.name;
        items[idx].price = prod.price;
        items[idx].total = prod.price * items[idx].qty;
      }
    }
    if (key === 'qty' || key === 'price') {
      items[idx].total = items[idx].price * items[idx].qty;
    }
    setForm(prev => ({ ...prev, items }));
  };

  const addItem = () => setForm(prev => ({
    ...prev,
    items: [...prev.items, { productId: '', productName: '', qty: 1, price: 0, total: 0 }],
  }));

  const removeItem = (idx) => setForm(prev => ({
    ...prev,
    items: prev.items.filter((_, i) => i !== idx),
  }));

  const subtotal = form.items.reduce((s, i) => s + (Number(i.total) || 0), 0);
  const total = subtotal - Number(form.discount || 0);
  const balance = total - Number(form.paid || 0);
  const customer = customers.find(c => c.id === form.customerId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.customerId) return alert('Please select a customer');
    if (form.items.some(i => !i.productId)) return alert('Please select products for all items');
    addInvoice({
      date: form.date,
      customerId: form.customerId,
      customerName: customer?.name || '',
      items: form.items.map(i => ({ ...i, qty: Number(i.qty), price: Number(i.price), total: Number(i.total) })),
      subtotal,
      discount: Number(form.discount || 0),
      total,
      paid: Number(form.paid || 0),
      balance: Math.max(0, balance),
      type: balance <= 0 ? 'cash' : form.type,
    });
    onClose();
    setForm({ customerId: '', date: new Date().toISOString().split('T')[0], items: [{ productId: '', productName: '', qty: 1, price: 0, total: 0 }], discount: 0, paid: 0, type: 'cash' });
  };

  const inputCls = "w-full bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:border-[#6c63ff] focus:outline-none transition-colors";
  const labelCls = "block text-[#8892a4] text-xs font-medium mb-1";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Invoice" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Customer *</label>
            <select className={inputCls} value={form.customerId} onChange={e => set('customerId', e.target.value)} required>
              <option value="">Select customer...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Date</label>
            <input type="date" className={inputCls} value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelCls}>Items *</label>
            <button type="button" onClick={addItem} className="text-xs text-[#6c63ff] hover:text-[#7c75ff] font-medium">+ Add Item</button>
          </div>
          <div className="space-y-2">
            {form.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 bg-[#1c2233] rounded-lg p-3">
                <div className="col-span-4">
                  <select className={inputCls} value={item.productId} onChange={e => setItem(idx, 'productId', e.target.value)}>
                    <option value="">Select product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <input type="number" placeholder="Qty" className={inputCls} value={item.qty} min="1"
                    onChange={e => setItem(idx, 'qty', Number(e.target.value))} />
                </div>
                <div className="col-span-3">
                  <input type="number" placeholder="Price" className={inputCls} value={item.price}
                    onChange={e => setItem(idx, 'price', Number(e.target.value))} />
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-[#22c55e] text-sm font-medium">{fmt(item.total)}</span>
                </div>
                <div className="col-span-1 flex items-center justify-end">
                  {form.items.length > 1 && (
                    <button type="button" onClick={() => removeItem(idx)} className="text-[#ef4444] hover:text-red-300 text-sm">✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-[#1c2233] rounded-lg p-4 grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Discount (Rs.)</label>
            <input type="number" className={inputCls} value={form.discount} min="0"
              onChange={e => set('discount', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Amount Paid (Rs.)</label>
            <input type="number" className={inputCls} value={form.paid} min="0" max={total}
              onChange={e => set('paid', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Payment Type</label>
            <select className={inputCls} value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="cash">Cash</option>
              <option value="credit">Credit (Udhar)</option>
            </select>
          </div>
          <div className="flex flex-col justify-center">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-[#8892a4]">Subtotal:</span>
                <span className="text-[#e8eaf0]">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8892a4]">Discount:</span>
                <span className="text-[#ef4444]">- {fmt(form.discount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-[#2a3248] pt-1">
                <span className="text-[#e8eaf0]">Total:</span>
                <span className="text-[#6c63ff]">{fmt(total)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-[#8892a4]">Balance:</span>
                <span className={balance > 0 ? 'text-[#f59e0b]' : 'text-[#22c55e]'}>{fmt(Math.max(0, balance))}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-[#2a3248] text-[#8892a4] rounded-lg hover:bg-white/5 transition-colors">Cancel</button>
          <button type="submit" className="px-6 py-2 text-sm bg-[#6c63ff] hover:bg-[#7c75ff] text-white rounded-lg font-medium transition-colors">Save Invoice</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Invoices() {
  const { invoices } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [viewInv, setViewInv] = useState(null);

  const totalAmount = invoices.reduce((s, i) => s + i.total, 0);
  const totalPaid = invoices.reduce((s, i) => s + i.paid, 0);
  const totalUdhar = invoices.reduce((s, i) => s + i.balance, 0);

  const rows = invoices.map(inv => [
    <span className="text-[#6c63ff] font-medium">{inv.invoiceNo}</span>,
    inv.date,
    inv.customerName,
    <span className="font-semibold">{fmt(inv.total)}</span>,
    <span className="text-[#22c55e]">{fmt(inv.paid)}</span>,
    <span className={inv.balance > 0 ? 'text-[#f59e0b] font-semibold' : 'text-[#8892a4]'}>{fmt(inv.balance)}</span>,
    <span className={`rounded-full text-xs px-2 py-0.5 ${inv.type === 'cash' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#f59e0b]/20 text-[#f59e0b]'}`}>
      {inv.type === 'cash' ? 'Cash' : 'Udhar'}
    </span>,
    <button onClick={() => setViewInv(inv)} className="text-xs text-[#6c63ff] hover:text-[#7c75ff] font-medium border border-[#6c63ff]/30 px-2 py-1 rounded-lg hover:bg-[#6c63ff]/10 transition-all">View</button>,
  ]);

  return (
    <div className="flex-1 overflow-y-auto">
      <Topbar
        title="Invoices"
        action={
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-[#6c63ff] hover:bg-[#7c75ff] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
            <span>+</span> New Invoice
          </button>
        }
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Invoices" value={invoices.length} sub="All time" color="accent" icon="🧾" />
          <StatCard label="Total Amount" value={fmt(totalAmount)} sub={`Paid: ${fmt(totalPaid)}`} color="green" icon="💰" />
          <StatCard label="Pending Udhar" value={fmt(totalUdhar)} sub="Outstanding balance" color="amber" icon="⏳" />
        </div>

        <div className="bg-[#161b27] rounded-xl border border-[#2a3248]">
          <div className="p-4 border-b border-[#2a3248]">
            <h3 className="text-[#e8eaf0] font-semibold">All Invoices</h3>
          </div>
          <Table
            headers={['Invoice #', 'Date', 'Customer', 'Total', 'Paid', 'Balance', 'Type', 'Action']}
            rows={rows}
            emptyMessage="No invoices yet. Create your first invoice!"
          />
        </div>
      </div>

      <InvoiceModal isOpen={showModal} onClose={() => setShowModal(false)} />

      {/* View Invoice Modal */}
      <Modal isOpen={!!viewInv} onClose={() => setViewInv(null)} title={`Invoice: ${viewInv?.invoiceNo}`} size="md">
        {viewInv && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-[#8892a4]">Customer:</span> <span className="text-[#e8eaf0] font-medium ml-1">{viewInv.customerName}</span></div>
              <div><span className="text-[#8892a4]">Date:</span> <span className="text-[#e8eaf0] ml-1">{viewInv.date}</span></div>
              <div><span className="text-[#8892a4]">Type:</span> <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${viewInv.type === 'cash' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#f59e0b]/20 text-[#f59e0b]'}`}>{viewInv.type}</span></div>
            </div>
            <div className="bg-[#1c2233] rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a3248]">
                    <th className="text-left text-[#8892a4] text-xs px-4 py-2">Product</th>
                    <th className="text-right text-[#8892a4] text-xs px-4 py-2">Qty</th>
                    <th className="text-right text-[#8892a4] text-xs px-4 py-2">Price</th>
                    <th className="text-right text-[#8892a4] text-xs px-4 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewInv.items.map((item, i) => (
                    <tr key={i} className="border-b border-[#2a3248]/40">
                      <td className="px-4 py-2 text-[#e8eaf0]">{item.productName}</td>
                      <td className="px-4 py-2 text-right text-[#8892a4]">{item.qty}</td>
                      <td className="px-4 py-2 text-right text-[#8892a4]">{fmt(item.price)}</td>
                      <td className="px-4 py-2 text-right text-[#e8eaf0]">{fmt(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#8892a4]">Subtotal</span><span className="text-[#e8eaf0]">{fmt(viewInv.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-[#8892a4]">Discount</span><span className="text-[#ef4444]">- {fmt(viewInv.discount)}</span></div>
              <div className="flex justify-between border-t border-[#2a3248] pt-2 font-bold"><span className="text-[#e8eaf0]">Total</span><span className="text-[#6c63ff]">{fmt(viewInv.total)}</span></div>
              <div className="flex justify-between"><span className="text-[#8892a4]">Paid</span><span className="text-[#22c55e]">{fmt(viewInv.paid)}</span></div>
              <div className="flex justify-between font-bold"><span className="text-[#8892a4]">Balance</span><span className={viewInv.balance > 0 ? 'text-[#f59e0b]' : 'text-[#22c55e]'}>{fmt(viewInv.balance)}</span></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
