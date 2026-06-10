import { createContext, useContext, useReducer, useEffect } from 'react';
import {
  seedProducts,
  seedCustomers,
  seedVendors,
  seedInvoices,
  seedPurchases,
  seedExpenses,
  seedVendorPayments,
} from '../data/seedData';

const AppContext = createContext(null);

// Load from localStorage or use seed data
function loadState() {
  try {
    const saved = localStorage.getItem('hashmi_fabrics_state');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {
    products: seedProducts,
    customers: seedCustomers,
    vendors: seedVendors,
    invoices: seedInvoices,
    purchases: seedPurchases,
    expenses: seedExpenses,
    vendorPayments: seedVendorPayments,
    invoiceCounter: 5,
    purchaseCounter: 5,
  };
}

function appReducer(state, action) {
  switch (action.type) {
    case 'ADD_INVOICE': {
      const invoice = action.payload;
      // Deduct stock
      const updatedProducts = state.products.map(p => {
        const item = invoice.items.find(i => i.productId === p.id);
        if (item) return { ...p, stock: Math.max(0, p.stock - item.qty) };
        return p;
      });
      // Update customer balance
      const updatedCustomers = state.customers.map(c => {
        if (c.id === invoice.customerId) {
          return {
            ...c,
            balance: c.balance + invoice.balance,
            totalBuy: c.totalBuy + invoice.total,
          };
        }
        return c;
      });
      return {
        ...state,
        invoices: [invoice, ...state.invoices],
        products: updatedProducts,
        customers: updatedCustomers,
        invoiceCounter: state.invoiceCounter + 1,
      };
    }

    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };

    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(c =>
          c.id === action.payload.id ? action.payload : c
        ),
      };

    case 'ADD_VENDOR':
      return { ...state, vendors: [...state.vendors, action.payload] };

    case 'UPDATE_VENDOR':
      return {
        ...state,
        vendors: state.vendors.map(v =>
          v.id === action.payload.id ? action.payload : v
        ),
      };

    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };

    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      };

    case 'ADD_PURCHASE': {
      const purchase = action.payload;
      const updatedVendors = state.vendors.map(v => {
        if (v.id === purchase.vendorId) {
          return {
            ...v,
            balance: v.balance + purchase.balance,
            totalPurchase: v.totalPurchase + purchase.total,
          };
        }
        return v;
      });
      return {
        ...state,
        purchases: [purchase, ...state.purchases],
        vendors: updatedVendors,
        purchaseCounter: state.purchaseCounter + 1,
      };
    }

    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] };

    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(e => e.id !== action.payload),
      };

    case 'RECEIVE_PAYMENT': {
      const { customerId, amount } = action.payload;
      return {
        ...state,
        customers: state.customers.map(c =>
          c.id === customerId
            ? { ...c, balance: Math.max(0, c.balance - amount) }
            : c
        ),
      };
    }

    case 'PAY_VENDOR': {
      const { vendorId, amount, date } = action.payload;
      const payment = {
        id: `vp_${Date.now()}`,
        vendorId,
        amount,
        date,
        vendorName: state.vendors.find(v => v.id === vendorId)?.name || '',
      };
      return {
        ...state,
        vendors: state.vendors.map(v =>
          v.id === vendorId
            ? { ...v, balance: Math.max(0, v.balance - amount) }
            : v
        ),
        vendorPayments: [payment, ...state.vendorPayments],
      };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null, loadState);

  // Persist to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem('hashmi_fabrics_state', JSON.stringify(state));
    } catch (e) {}
  }, [state]);

  // Helper functions
  const addInvoice = (invoiceData) => {
    const invoiceNo = `HF-${String(state.invoiceCounter).padStart(3, '0')}`;
    const invoice = {
      id: `inv_${Date.now()}`,
      invoiceNo,
      ...invoiceData,
    };
    dispatch({ type: 'ADD_INVOICE', payload: invoice });
    return invoice;
  };

  const addCustomer = (data) => {
    const customer = { id: `c_${Date.now()}`, ...data, balance: 0, totalBuy: 0 };
    dispatch({ type: 'ADD_CUSTOMER', payload: customer });
  };

  const addVendor = (data) => {
    const vendor = { id: `v_${Date.now()}`, ...data, balance: 0, totalPurchase: 0 };
    dispatch({ type: 'ADD_VENDOR', payload: vendor });
  };

  const addProduct = (data) => {
    const product = { id: `p_${Date.now()}`, ...data };
    dispatch({ type: 'ADD_PRODUCT', payload: product });
  };

  const updateProduct = (data) => dispatch({ type: 'UPDATE_PRODUCT', payload: data });

  const addPurchase = (purchaseData) => {
    const poNo = `PO-${String(state.purchaseCounter).padStart(3, '0')}`;
    const purchase = { id: `pur_${Date.now()}`, poNo, ...purchaseData };
    dispatch({ type: 'ADD_PURCHASE', payload: purchase });
  };

  const addExpense = (data) => {
    const expense = { id: `exp_${Date.now()}`, ...data };
    dispatch({ type: 'ADD_EXPENSE', payload: expense });
  };

  const deleteExpense = (id) => dispatch({ type: 'DELETE_EXPENSE', payload: id });

  const receivePayment = (customerId, amount) =>
    dispatch({ type: 'RECEIVE_PAYMENT', payload: { customerId, amount } });

  const payVendor = (vendorId, amount, date) =>
    dispatch({ type: 'PAY_VENDOR', payload: { vendorId, amount, date } });

  return (
    <AppContext.Provider
      value={{
        ...state,
        addInvoice,
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
