import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Topbar from '../components/Topbar';
import Modal from '../components/Modal';

const fmt = (n) => `Rs. ${Number(n || 0).toLocaleString('en-PK')}`;

const categories = ['Fabric', 'Suit Piece', 'Dupatta', 'Panel', 'Other'];

function ProductForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || {
    name: '', category: 'Fabric', unit: 'Meter', price: '', cost: '', stock: '', reorderLevel: ''
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const inputCls = "w-full bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:border-[#6c63ff] focus:outline-none transition-colors";
  const labelCls = "block text-[#8892a4] text-xs font-medium mb-1";

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      price: Number(form.price),
      cost: Number(form.cost),
      stock: Number(form.stock),
      reorderLevel: Number(form.reorderLevel),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelCls}>Product Name *</label>
          <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Lawn Fabric" required />
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Unit</label>
          <select className={inputCls} value={form.unit} onChange={e => set('unit', e.target.value)}>
            <option>Meter</option>
            <option>Piece</option>
            <option>Yard</option>
            <option>Box</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Sale Price (Rs.) *</label>
          <input type="number" className={inputCls} value={form.price} onChange={e => set('price', e.target.value)} placeholder="0" min="0" required />
        </div>
        <div>
          <label className={labelCls}>Cost Price (Rs.) *</label>
          <input type="number" className={inputCls} value={form.cost} onChange={e => set('cost', e.target.value)} placeholder="0" min="0" required />
        </div>
        <div>
          <label className={labelCls}>Opening Stock</label>
          <input type="number" className={inputCls} value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="0" min="0" />
        </div>
        <div>
          <label className={labelCls}>Reorder Level</label>
          <input type="number" className={inputCls} value={form.reorderLevel} onChange={e => set('reorderLevel', e.target.value)} placeholder="0" min="0" />
        </div>
      </div>
      {form.price && form.cost && (
        <div className="bg-[#1c2233] rounded-lg p-3 text-sm">
          <span className="text-[#8892a4]">Profit Margin: </span>
          <span className="text-[#22c55e] font-semibold">
            {form.price > 0 ? Math.round(((form.price - form.cost) / form.price) * 100) : 0}%
          </span>
          <span className="text-[#8892a4] ml-2">({fmt(form.price - form.cost)} per unit)</span>
        </div>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-[#2a3248] text-[#8892a4] rounded-lg hover:bg-white/5 transition-colors">Cancel</button>
        <button type="submit" className="px-6 py-2 text-sm bg-[#6c63ff] hover:bg-[#7c75ff] text-white rounded-lg font-medium transition-colors">Save Product</button>
      </div>
    </form>
  );
}

export default function Products() {
  const { products, addProduct, updateProduct } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editProd, setEditProd] = useState(null);

  const margin = (p) => p.price > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) : 0;

  const stockColor = (p) => {
    if (p.stock === 0) return 'bg-[#ef4444]/20 text-[#ef4444]';
    if (p.stock <= p.reorderLevel) return 'bg-[#f59e0b]/20 text-[#f59e0b]';
    return 'bg-[#22c55e]/20 text-[#22c55e]';
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Topbar
        title="Products"
        action={
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-[#6c63ff] hover:bg-[#7c75ff] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
            <span>+</span> Add Product
          </button>
        }
      />
      <div className="p-6">
        <div className="bg-[#161b27] rounded-xl border border-[#2a3248]">
          <div className="p-4 border-b border-[#2a3248] flex items-center justify-between">
            <h3 className="text-[#e8eaf0] font-semibold">All Products</h3>
            <span className="text-[#8892a4] text-xs">{products.length} products</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a3248]">
                  {['Product Name', 'Category', 'Sale Price', 'Cost', 'Margin', 'Stock', 'Action'].map(h => (
                    <th key={h} className="text-left text-[#8892a4] text-xs font-semibold uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-[#2a3248]/50 hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-[#e8eaf0] font-medium">{p.name}</p>
                      <p className="text-[#8892a4] text-xs">{p.unit}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-[#6c63ff]/10 text-[#6c63ff] text-xs px-2 py-0.5 rounded-full">{p.category}</span>
                    </td>
                    <td className="px-4 py-3 text-[#e8eaf0] font-medium">{fmt(p.price)}</td>
                    <td className="px-4 py-3 text-[#8892a4]">{fmt(p.cost)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-[#2a3248] rounded-full overflow-hidden">
                          <div className="h-full bg-[#22c55e] rounded-full" style={{ width: `${Math.min(margin(p), 100)}%` }} />
                        </div>
                        <span className="text-[#22c55e] text-xs font-medium">{margin(p)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stockColor(p)}`}>
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setEditProd(p)}
                        className="text-xs text-[#6c63ff] border border-[#6c63ff]/30 px-2 py-1 rounded-lg hover:bg-[#6c63ff]/10 transition-all font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-[#8892a4] py-12">No products added yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Product" size="md">
        <ProductForm onSubmit={(data) => { addProduct(data); setShowAdd(false); }} onCancel={() => setShowAdd(false)} />
      </Modal>

      <Modal isOpen={!!editProd} onClose={() => setEditProd(null)} title="Edit Product" size="md">
        {editProd && (
          <ProductForm
            initial={editProd}
            onSubmit={(data) => { updateProduct(data); setEditProd(null); }}
            onCancel={() => setEditProd(null)}
          />
        )}
      </Modal>
    </div>
  );
}
