import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/slices/authSlice'

const navSections = [
  {
    label: 'Main',
    items: [
      { to: '/', icon: 'ti-layout-dashboard', label: 'Dashboard', exact: true },
    ]
  },
  {
    label: 'Accounts Setup',
    items: [
      { to: '/setup/towns',     icon: 'ti-map-pin',      label: 'Towns / Localities' },
      { to: '/setup/groups',    icon: 'ti-users-group',  label: 'Groups' },
      { to: '/setup/companies', icon: 'ti-building',     label: 'Companies' },
      { to: '/setup/products',  icon: 'ti-box',          label: 'Products' },
      { to: '/setup/customers', icon: 'ti-store',        label: 'Customers' },
      { to: '/setup/bookers',   icon: 'ti-user-circle',  label: 'Bookers' },
    ]
  },
  {
    label: 'Transactions',
    items: [
      { to: '/transactions/pos',      icon: 'ti-receipt',      label: 'Point of Sale' },
      { to: '/transactions/sales',    icon: 'ti-file-invoice', label: 'Sales Invoice' },
      { to: '/transactions/return',   icon: 'ti-refresh',      label: 'Sales Return' },
      { to: '/transactions/purchase', icon: 'ti-shopping-cart',label: 'Purchase Invoice' },
      { to: '/transactions/ar',       icon: 'ti-cash',         label: 'A/R Collection', badge: '1192', badgeType: 'danger' },
      { to: '/transactions/ap',       icon: 'ti-credit-card',  label: 'A/P Payment' },
      { to: '/transactions/vouchers', icon: 'ti-notes',        label: 'Vouchers' },
      { to: '/transactions/stock-out',icon: 'ti-package-off',  label: 'Stock Out' },
    ]
  },
  {
    label: 'Reports',
    items: [
      { to: '/reports/ledger',   icon: 'ti-book',        label: 'Customer Ledger' },
      { to: '/reports/sales',    icon: 'ti-chart-bar',   label: 'Sales Report' },
      { to: '/reports/stock',    icon: 'ti-box',         label: 'Stock Report' },
      { to: '/reports/pl',       icon: 'ti-chart-pie',   label: 'Profit / Loss' },
      { to: '/reports/overdue',  icon: 'ti-alert-triangle', label: 'Overdue', badge: '!', badgeType: 'warning' },
    ]
  },
  {
    label: 'Admin',
    items: [
      { to: '/admin/settings', icon: 'ti-settings',  label: 'System Settings' },
      { to: '/admin/unlock',   icon: 'ti-lock-open', label: 'Unlock Vouchers' },
      { to: '/admin/users',    icon: 'ti-users',     label: 'Users' },
    ]
  },
]

export default function Sidebar() {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const user       = useSelector(s => s.auth.user)

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'HT'

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <aside className="ht-sidebar">
      {/* Logo */}
      <div className="ht-sidebar-logo">
        <div className="ht-logo-mark">HT</div>
        <div>
          <div className="ht-logo-name">Hashmi Traders</div>
          <div className="ht-logo-sub">Distribution System</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="ht-sidebar-nav">
        {navSections.map(section => (
          <div key={section.label}>
            <div className="ht-nav-section">{section.label}</div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `ht-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <i className={`ti ${item.icon}`} aria-hidden="true" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`ht-nav-badge ${item.badgeType}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="ht-sidebar-footer">
        <div className="ht-user-avatar">{initials}</div>
        <div className="ht-user-info">
          <div className="ht-user-name">{user?.name || 'Admin'}</div>
          <div className="ht-user-role">{user?.role || 'Administrator'}</div>
        </div>
        <button className="ht-logout-btn" onClick={handleLogout} title="Logout">
          <i className="ti ti-logout" aria-hidden="true" />
        </button>
      </div>
    </aside>
  )
}
