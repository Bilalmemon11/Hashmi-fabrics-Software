import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import api from '../services/api';

const AppContext = createContext(null);

const mapProduct = (p) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  price: Number(p.price),
  cost: Number(p.cost_price),
  stock: Number(p.stock_qty),
  unit: p.unit,
  reorderLevel: Number(p.reorder_level),
});

const mapCustomer = (c) => ({
  id: c.id,
  name: c.name,
  phone: c.phone || '',
  type: c.type,
  balance: Number(c.balance),
  totalBuy: Number(c.total_purchase),
});

const mapVendor = (v) => ({
  id: v.id,
  name: v.name,
  phone: v.phone || '',
  city: v.city || '',
  balance: Number(v.balance),
  totalPurchase: Number(v.total_purchase),
});

const mapInvoice = (inv) => ({
  id: inv.id,
  invoiceNo: inv.invoice_no,
  customerId: inv.customer_id,
  customerName: inv.customer_name || inv.customer?.name || '',
  date: String(inv.date).split('T')[0],
  subtotal: Number(inv.subtotal),
  discount: Number(inv.discount),
  total: Number(inv.total),
  paid: Number(inv.paid),
  balance: Number(inv.balance),
  type: inv.payment_type,
  items: (inv.items || []).map((i) => ({
    productId: i.product_id,
    productName: i.product?.name || i.product_name || '',
    qty: Number(i.qty),
    price: Number(i.unit_price),
    total: Number(i.total),
  })),
});

const mapPurchase = (p) => ({
  id: p.id,
  poNo: p.po_no,
  vendorId: p.vendor_id,
  vendorName: p.vendor_name || p.vendor?.name || '',
  date: String(p.date).split('T')[0],
  itemsDescription: p.items_description || '',
  description: p.items_description || '',
  total: Number(p.total),
  paid: Number(p.paid),
  balance: Number(p.balance),
});

const mapExpense = (e) => ({
  id: e.id,
  date: String(e.date).split('T')[0],
  category: e.category,
  description: e.description || '',
  amount: Number(e.amount),
});

const initialState = {
  products: [],
  customers: [],
  vendors: [],
  invoices: [],
  purchases: [],
  expenses: [],
  loading: true,
  error: null,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_ALL':
      return { ...state, ...action.payload, loading: false, error: null };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };
    case 'SET_VENDORS':
      return { ...state, vendors: action.payload };
    case 'SET_INVOICES':
      return { ...state, invoices: action.payload };
    case 'SET_PURCHASES':
      return { ...state, purchases: action.payload };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const showError = (msg) => {
    dispatch({ type: 'SET_ERROR', payload: msg });
    alert(msg);
  };

  const refreshAll = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [productsRes, customersRes, vendorsRes, invoicesRes, purchasesRes, expensesRes] =
        await Promise.all([
          api.get('/products'),
          api.get('/customers'),
          api.get('/vendors'),
          api.get('/invoices'),
          api.get('/purchases'),
          api.get('/expenses'),
        ]);

      dispatch({
        type: 'SET_ALL',
        payload: {
          products: productsRes.data.data.map(mapProduct),
          customers: customersRes.data.data.map(mapCustomer),
          vendors: vendorsRes.data.data.map(mapVendor),
          invoices: invoicesRes.data.data.map(mapInvoice),
          purchases: purchasesRes.data.data.map(mapPurchase),
          expenses: expensesRes.data.data.map(mapExpense),
        },
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to connect to server';
      dispatch({ type: 'SET_ERROR', payload: msg });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  useEffect(() => {
    localStorage.removeItem('hashmi_fabrics_state');
    refreshAll();
  }, [refreshAll]);

  const addInvoice = async (invoiceData) => {
    try {
      const payload = {
        customer_id: invoiceData.customerId,
        date: invoiceData.date,
        subtotal: invoiceData.subtotal,
        discount: invoiceData.discount || 0,
        total: invoiceData.total,
        paid: invoiceData.paid || 0,
        balance: invoiceData.balance || 0,
        payment_type: invoiceData.type === 'credit' ? 'credit' : 'cash',
        items: invoiceData.items.map((i) => ({
          product_id: i.productId,
          qty: i.qty,
          unit_price: i.price,
          total: i.total,
        })),
      };
      const res = await api.post('/invoices', payload);
      await refreshAll();
      return mapInvoice(res.data.data);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create invoice');
      throw err;
    }
  };

  const fetchInvoice = async (id) => {
    const res = await api.get(`/invoices/${id}`);
    return mapInvoice(res.data.data);
  };

  const addCustomer = async (data) => {
    try {
      await api.post('/customers', data);
      const res = await api.get('/customers');
      dispatch({ type: 'SET_CUSTOMERS', payload: res.data.data.map(mapCustomer) });
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to add customer');
    }
  };

  const addVendor = async (data) => {
    try {
      await api.post('/vendors', data);
      const res = await api.get('/vendors');
      dispatch({ type: 'SET_VENDORS', payload: res.data.data.map(mapVendor) });
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to add vendor');
    }
  };

  const addProduct = async (data) => {
    try {
      await api.post('/products', {
        name: data.name,
        category: data.category,
        price: data.price,
        cost_price: data.cost,
        stock_qty: data.stock || 0,
        unit: data.unit?.toLowerCase() || 'pcs',
        reorder_level: data.reorderLevel || 5,
      });
      const res = await api.get('/products');
      dispatch({ type: 'SET_PRODUCTS', payload: res.data.data.map(mapProduct) });
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to add product');
    }
  };

  const updateProduct = async (data) => {
    try {
      await api.put(`/products/${data.id}`, {
        name: data.name,
        category: data.category,
        price: data.price,
        cost_price: data.cost,
        stock_qty: data.stock,
        unit: data.unit?.toLowerCase() || 'pcs',
        reorder_level: data.reorderLevel,
      });
      const res = await api.get('/products');
      dispatch({ type: 'SET_PRODUCTS', payload: res.data.data.map(mapProduct) });
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update product');
    }
  };

  const addPurchase = async (purchaseData) => {
    try {
      await api.post('/purchases', {
        vendor_id: purchaseData.vendorId,
        date: purchaseData.date,
        items_description: purchaseData.itemsDescription || purchaseData.description || '',
        total: purchaseData.total,
        paid: purchaseData.paid || 0,
        balance: purchaseData.balance ?? purchaseData.total - (purchaseData.paid || 0),
      });
      await refreshAll();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create purchase');
    }
  };

  const addExpense = async (data) => {
    try {
      await api.post('/expenses', data);
      const res = await api.get('/expenses');
      dispatch({ type: 'SET_EXPENSES', payload: res.data.data.map(mapExpense) });
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to add expense');
    }
  };

  const deleteExpense = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      dispatch({ type: 'SET_EXPENSES', payload: state.expenses.filter((e) => e.id !== id) });
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  const receivePayment = async (customerId, amount) => {
    try {
      await api.post(`/customers/${customerId}/receive-payment`, { amount });
      const res = await api.get('/customers');
      dispatch({ type: 'SET_CUSTOMERS', payload: res.data.data.map(mapCustomer) });
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to receive payment');
    }
  };

  const payVendor = async (vendorId, amount, date) => {
    try {
      await api.post(`/vendors/${vendorId}/pay`, { amount, date });
      const res = await api.get('/vendors');
      dispatch({ type: 'SET_VENDORS', payload: res.data.data.map(mapVendor) });
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to pay vendor');
    }
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        refreshAll,
        addInvoice,
        fetchInvoice,
        addCustomer,
        addVendor,
        addProduct,
        updateProduct,
        addPurchase,
        addExpense,
        deleteExpense,
        receivePayment,
        payVendor,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
