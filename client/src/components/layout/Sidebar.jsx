import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const tenantLinks = [
  { to: '/dashboard',          labelKey: 'nav.dashboard' },
  { to: '/dashboard/invoices', labelKey: 'tenant.invoices_title' },
  { to: '/dashboard/contract', labelKey: 'tenant.contract_title' },
]

const adminLinks = [
  { to: '/admin',            labelKey: 'admin.dashboard_title' },
  { to: '/admin/users',      labelKey: 'admin.users_title' },
  { to: '/admin/properties', labelKey: 'admin.properties_title' },
  { to: '/admin/invoices',   labelKey: 'admin.invoices_title' },
  { to: '/admin/contracts',  labelKey: 'admin.contracts_title' },
  { to: '/admin/faq',        labelKey: 'admin.faq_title' },
]

export default function Sidebar({ role }) {
  const { t } = useTranslation()
  const links = role === 'admin' ? adminLinks : tenantLinks

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 min-h-screen pt-6 px-3">
      <nav className="flex flex-col gap-1">
        {links.map(({ to, labelKey }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard' || to === '/admin'}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            {t(labelKey)}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
