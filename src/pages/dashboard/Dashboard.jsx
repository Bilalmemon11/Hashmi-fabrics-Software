import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

// ── Helpers ────────────────────────────────────────────────────
const fmt = (n) =>
  'Rs ' + Number(n || 0).toLocaleString('en-PK', { minimumFractionDigits: 0 })

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })

// ── Sub-components ─────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, colorClass }) {
  return (
    <div className="ht-kpi">
      <div className="ht-kpi-label">
        <i className={`ti ${icon}`} aria-hidden="true" />
        {label}
      </div>
      <div className={`ht-kpi-val ${colorClass}`}>{value}</div>
      {sub && <div className="ht-kpi-sub">{sub}</div>}
    </div>
  )
}

function AlertItem({ dotColor, text, count, countClass, onClick }) {
  return (
    <div className="ht-alert-item" onClick={onClick} role="button" tabIndex={0}>
      <div className={`ht-alert-dot ${dotColor}`} />
      <span style={{ flex: 1, fontSize: 12, color: 'var(--text-1)' }}>{text}</span>
      {count !== undefined && (
        <span className={`ht-badge ht-badge-${countClass}`} style={{ fontSize: 10 }}>
          {Number(count).toLocaleString()}
        </span>
      )}
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()

  // Hardcoded fallback data (replace with real API calls)
  const [stats, setStats] = useState({
    todaySales:       84320,
    todayInvoices:    14,
    monthlyRevenue:   1264800,
    totalOutstanding: 3892400,
    overdueCount:     1192,
    stockValue:       2148560,
    activeProducts:   378,
    belowZero:        161,
    nearEnd:          0,
    toAdjust:         2,
  })

  const [recentSales] = useState([
    { inv_no: 'CM-4117', customer: 'Maryam Traders',    town: 'Hyderabad', booker: 'Ali Raza', amount: 12660,  pay_mode: 'CASH'   },
    { inv_no: 'CM-4116', customer: 'Waseem G/S',        town: 'Hali Road', booker: 'Ali Raza', amount: 8200,   pay_mode: 'CREDIT' },
    { inv_no: 'CM-4115', customer: 'Areeba Cos',        town: 'Hali Road', booker: 'Ali Raza', amount: 24500,  pay_mode: 'CREDIT' },
    { inv_no: 'CM-4114', customer: 'Hareem G/S',        town: 'Bathoro',   booker: 'Ali Raza', amount: 6100,   pay_mode: 'CASH'   },
    { inv_no: 'CM-4113', customer: 'Black & Gold WS',   town: 'Hyderabad', booker: 'Ali Raza', amount: 32860,  pay_mode: 'OVERDUE'},
  ])

  const [lowStock] = useState([
    { code: '101',    name: 'Parley Bleach Sachet 28gm',    stock: -24975, status: 'zero' },
    { code: '1025',   name: 'Current Meclay Shampoo 660ml', stock: 8,      status: 'low'  },
    { code: '4100',   name: 'D&G Hand Wash 500ml Mix',      stock: 12,     status: 'low'  },
    { code: '0882',   name: 'Shampoo + MEC Face Wash',      stock: 0,      status: 'zero' },
  ])

  const [overdueCustomers] = useState([
    { code: '/100015', name: 'Waseem G/S',       town: 'Hyd WS',    amount: 14460, days: 92 },
    { code: '/848323', name: 'Black & Gold WS',  town: 'Hyderabad', amount: 54252, days: 65 },
    { code: '/100042', name: 'Parley Wajee R/T', town: 'Bathoro',   amount: 8900,  days: 38 },
    { code: '/100087', name: 'Hareem G/S',        town: 'Bathoro',  amount: 4200,  days: 31 },
  ])

  // Uncomment to fetch real data from Laravel API:
  // useEffect(() => {
  //   api.get('/dashboard').then(r => setStats(r.data))
  // }, [])

  const payBadge = (mode) => {
    if (mode === 'CASH')   return <span className="ht-badge ht-badge-green">Cash</span>
    if (mode === 'CREDIT') return <span className="ht-badge ht-badge-amber">Credit</span>
    if (mode === 'OVERDUE')return <span className="ht-badge ht-badge-red">Overdue</span>
    return <span className="ht-badge ht-badge-gray">{mode}</span>
  }

  const stockBadge = (status) =>
    status === 'zero'
      ? <span className="ht-badge ht-badge-red">Zero</span>
      : <span className="ht-badge ht-badge-amber">Low</span>

  const daysBadge = (days) =>
    days >= 60
      ? <span className="ht-badge ht-badge-red">{days}d</span>
      : <span className="ht-badge ht-badge-amber">{days}d</span>

  return (
    <>
      {/* ── KPI Grid ── */}
      <div className="ht-grid-4 mb-4">
        <KpiCard
          label="Today's Sales"
          value={fmt(stats.todaySales)}
          sub={`${stats.todayInvoices} invoices today`}
          icon="ti-cash"
          colorClass="blue"
        />
        <KpiCard
          label="Monthly Revenue"
          value={fmt(stats.monthlyRevenue)}
          sub="June 2026"
          icon="ti-trending-up"
          colorClass="green"
        />
        <KpiCard
          label="Total Outstanding"
          value={fmt(stats.totalOutstanding)}
          sub={`${stats.overdueCount.toLocaleString()} customers`}
          icon="ti-wallet"
          colorClass="red"
        />
        <KpiCard
          label="Stock Value"
          value={fmt(stats.stockValue)}
          sub={`${stats.activeProducts} active products`}
          icon="ti-box"
          colorClass="amber"
        />
      </div>

      {/* ── Main Row: Recent Sales + Reminder Panel ── */}
      <div className="ht-grid-main mb-3">

        {/* Recent Sales */}
        <div className="ht-card">
          <div className="ht-card-head">
            <span className="ht-card-title">
              <i className="ti ti-receipt" aria-hidden="true" />
              Recent Sales Invoices
            </span>
            <span className="ht-card-action" onClick={() => navigate('/transactions/sales')}>
              View all <i className="ti ti-arrow-right" style={{ fontSize: 13 }} aria-hidden="true" />
            </span>
          </div>
          <table className="ht-table">
            <thead>
              <tr>
                <th>Inv No</th>
                <th>Customer</th>
                <th>Town</th>
                <th>Booker</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map(s => (
                <tr key={s.inv_no} style={{ cursor: 'pointer' }}>
                  <td style={{ color: 'var(--blue)', fontWeight: 500, fontFamily: 'var(--mono)', fontSize: 12 }}>
                    {s.inv_no}
                  </td>
                  <td style={{ fontWeight: 500 }}>{s.customer}</td>
                  <td style={{ color: 'var(--text-2)' }}>{s.town}</td>
                  <td style={{ color: 'var(--text-3)', fontSize: 12 }}>{s.booker}</td>
                  <td style={{ fontWeight: 500 }}>{fmt(s.amount)}</td>
                  <td>{payBadge(s.pay_mode)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Reminder Panel */}
        <div className="ht-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="ht-card-head">
            <span className="ht-card-title">
              <i className="ti ti-bell" style={{ color: 'var(--red)' }} aria-hidden="true" />
              Reminders
            </span>
          </div>

          <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <AlertItem dotColor="amber"  text="Items to adjust"         count={stats.toAdjust}    countClass="amber"  onClick={() => navigate('/setup/products')} />
            <AlertItem dotColor="red"    text="Items below ZERO stock"  count={stats.belowZero}   countClass="red"    onClick={() => navigate('/reports/stock')} />
            <AlertItem dotColor="amber"  text="Items near minimum"      count={stats.nearEnd}     countClass="amber"  onClick={() => navigate('/reports/stock')} />
            <AlertItem dotColor="red"    text="Customers not paying"    count={stats.overdueCount} countClass="red"   onClick={() => navigate('/reports/overdue')} />
            <AlertItem dotColor="blue"   text="Check A/R invoice order" count={undefined}          countClass=""      onClick={() => navigate('/transactions/ar')} />
          </div>

          <div style={{ borderTop: '1px solid var(--border)', padding: '8px 14px 4px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Must View
            </div>
            <div
              onClick={() => navigate('/reports/sales')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--blue)', padding: '3px 0', cursor: 'pointer' }}
            >
              <i className="ti ti-file-text" style={{ fontSize: 14 }} aria-hidden="true" />
              Purchase Price List
            </div>
            <div
              onClick={() => navigate('/reports/sales')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--blue)', padding: '3px 0', cursor: 'pointer' }}
            >
              <i className="ti ti-chart-bar" style={{ fontSize: 14 }} aria-hidden="true" />
              Quick View Report
            </div>
          </div>

          {/* Mini bar chart */}
          <div style={{ borderTop: '1px solid var(--border)', padding: '8px 14px 12px', marginTop: 'auto' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Monthly trend
            </div>
            <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 40 }}>
              {[55, 70, 45, 80, 60, 90].map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    background: i === 5 ? 'var(--blue)' : 'var(--blue-lt)',
                    borderRadius: '2px 2px 0 0',
                    transition: 'height 0.3s ease',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 3, marginTop: 3 }}>
              {['Jan','Feb','Mar','Apr','May','Jun'].map(m => (
                <div key={m} style={{ flex: 1, fontSize: 9, color: 'var(--text-3)', textAlign: 'center' }}>{m}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Low Stock + Overdue ── */}
      <div className="ht-grid-2">

        {/* Low Stock */}
        <div className="ht-card">
          <div className="ht-card-head">
            <span className="ht-card-title">
              <i className="ti ti-alert-triangle" style={{ color: 'var(--amber)' }} aria-hidden="true" />
              Low / Zero Stock
            </span>
            <span className="ht-card-action" onClick={() => navigate('/reports/stock')}>
              View all ({stats.belowZero})
            </span>
          </div>
          <table className="ht-table">
            <thead>
              <tr><th>Code</th><th>Product</th><th>Stock</th><th>Status</th></tr>
            </thead>
            <tbody>
              {lowStock.map(p => (
                <tr key={p.code}>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--amber)' }}>{p.code}</td>
                  <td style={{ fontSize: 12 }}>{p.name}</td>
                  <td style={{ fontWeight: 500, color: p.stock <= 0 ? 'var(--red)' : 'var(--amber)' }}>
                    {p.stock.toLocaleString()}
                  </td>
                  <td>{stockBadge(p.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', gap: 0, borderTop: '1px solid var(--border)' }}>
            {[
              { val: stats.belowZero, label: 'Below zero', color: 'var(--red)'   },
              { val: stats.nearEnd,   label: 'Near end',   color: 'var(--amber)' },
              { val: 203,             label: 'Healthy',    color: 'var(--green)' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue Customers */}
        <div className="ht-card">
          <div className="ht-card-head">
            <span className="ht-card-title">
              <i className="ti ti-user-x" style={{ color: 'var(--red)' }} aria-hidden="true" />
              Overdue Customers
            </span>
            <span className="ht-card-action" onClick={() => navigate('/reports/overdue')}>
              View all {stats.overdueCount.toLocaleString()}
            </span>
          </div>
          <table className="ht-table">
            <thead>
              <tr><th>Code</th><th>Customer</th><th>Town</th><th>Outstanding</th><th>Days</th></tr>
            </thead>
            <tbody>
              {overdueCustomers.map(c => (
                <tr key={c.code} style={{ cursor: 'pointer' }} onClick={() => navigate('/reports/ledger')}>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--blue)' }}>{c.code}</td>
                  <td style={{ fontWeight: 500, fontSize: 12 }}>{c.name}</td>
                  <td style={{ color: 'var(--text-2)', fontSize: 12 }}>{c.town}</td>
                  <td style={{ fontWeight: 500, color: 'var(--red)', fontSize: 12 }}>{fmt(c.amount)}</td>
                  <td>{daysBadge(c.days)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', borderTop: '1px solid var(--border)' }}>
            {[
              { val: 284, label: '90+ days', color: 'var(--red)'   },
              { val: 431, label: '60+ days', color: 'var(--red)'   },
              { val: 477, label: '30+ days', color: 'var(--amber)' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}
