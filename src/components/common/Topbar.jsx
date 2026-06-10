import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

const pageTitles = {
  '/':                       { title: 'Dashboard',          icon: 'ti-layout-dashboard' },
  '/setup/towns':            { title: 'Towns & Localities',  icon: 'ti-map-pin'          },
  '/setup/groups':           { title: 'Groups',              icon: 'ti-users-group'      },
  '/setup/companies':        { title: 'Companies',           icon: 'ti-building'         },
  '/setup/products':         { title: 'Products',            icon: 'ti-box'              },
  '/setup/customers':        { title: 'Customers',           icon: 'ti-store'            },
  '/setup/bookers':          { title: 'Bookers',             icon: 'ti-user-circle'      },
  '/transactions/pos':       { title: 'Point of Sale',       icon: 'ti-receipt'          },
  '/transactions/sales':     { title: 'Sales Invoice',       icon: 'ti-file-invoice'     },
  '/transactions/purchase':  { title: 'Purchase Invoice',    icon: 'ti-shopping-cart'    },
  '/transactions/ar':        { title: 'A/R Collection',      icon: 'ti-cash'             },
  '/transactions/vouchers':  { title: 'Vouchers',            icon: 'ti-notes'            },
  '/reports/ledger':         { title: 'Customer Ledger',     icon: 'ti-book'             },
  '/reports/sales':          { title: 'Sales Report',        icon: 'ti-chart-bar'        },
  '/reports/pl':             { title: 'Profit / Loss',       icon: 'ti-chart-pie'        },
  '/reports/overdue':        { title: 'Overdue Customers',   icon: 'ti-alert-triangle'   },
  '/admin/settings':         { title: 'System Settings',     icon: 'ti-settings'         },
}

export default function Topbar() {
  const location = useLocation()
  const user     = useSelector(s => s.auth.user)
  const page     = pageTitles[location.pathname] || { title: 'Hashmi Traders', icon: 'ti-home' }

  const now = new Date().toLocaleDateString('en-PK', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  })

  return (
    <header className="ht-topbar">
      <div className="ht-topbar-left">
        <i className={`ti ${page.icon} ht-topbar-icon`} aria-hidden="true" />
        <h1 className="ht-topbar-title">{page.title}</h1>
      </div>
      <div className="ht-topbar-right">
        <span className="ht-topbar-date">
          <i className="ti ti-calendar" aria-hidden="true" />
          {now}
        </span>
        {location.pathname === '/transactions/pos' && (
          <button className="ht-btn ht-btn-primary">
            <i className="ti ti-plus" aria-hidden="true" /> New Invoice
          </button>
        )}
        {location.pathname === '/setup/customers' && (
          <button className="ht-btn ht-btn-primary">
            <i className="ti ti-plus" aria-hidden="true" /> Add Customer
          </button>
        )}
        {location.pathname === '/setup/products' && (
          <button className="ht-btn ht-btn-primary">
            <i className="ti ti-plus" aria-hidden="true" /> Add Product
          </button>
        )}
      </div>
    </header>
  )
}
