import { NavLink, useLocation } from 'react-router-dom';

const navGroups = [
  {
    label: 'Sales',
    items: [
      { path: '/invoices', icon: '🧾', label: 'Invoices' },
      { path: '/customers', icon: '👥', label: 'Customers' },
    ],
  },
  {
    label: 'Stock',
    items: [
      { path: '/products', icon: '📦', label: 'Products' },
      { path: '/inventory', icon: '🏭', label: 'Inventory' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { path: '/vendors', icon: '🏪', label: 'Vendors' },
      { path: '/purchases', icon: '🛒', label: 'Purchases' },
      { path: '/expenses', icon: '💸', label: 'Expenses' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { path: '/reports', icon: '📊', label: 'Reports' },
      { path: '/profit-loss', icon: '📈', label: 'Profit & Loss' },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-[#161b27] border-r border-[#2a3248] flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-[#2a3248]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6c63ff] flex items-center justify-center text-xl">
            🧵
          </div>
          <div>
            <h1 className="text-[#e8eaf0] font-bold text-sm leading-tight">Hashmi Fabrics</h1>
            <p className="text-[#8892a4] text-xs">Business Management</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="text-[#8892a4] text-xs font-semibold uppercase tracking-widest px-3 mb-2">
              {group.label}
            </p>
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#6c63ff]/20 text-[#6c63ff] border border-[#6c63ff]/30'
                      : 'text-[#8892a4] hover:bg-white/5 hover:text-[#e8eaf0] border border-transparent'
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#2a3248]">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-[#6c63ff]/20 text-[#6c63ff] border border-[#6c63ff]/30'
                : 'text-[#8892a4] hover:bg-white/5 hover:text-[#e8eaf0] border border-transparent'
            }`
          }
          end
        >
          <span className="text-base">🏠</span>
          <span>Dashboard</span>
        </NavLink>
      </div>
    </aside>
  );
}
