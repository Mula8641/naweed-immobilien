import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext.jsx'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { getMyInvoices } from '../../api/invoices.js'
import { formatCurrency } from '../../utils/formatters.js'

export default function TenantDashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [invoices, setInvoices] = useState([])

  useEffect(() => {
    getMyInvoices().then(setInvoices).catch(() => {})
  }, [])

  const latest = invoices[0]
  const unpaidCount = invoices.filter(i => i.status === 'unpaid').length

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('tenant.dashboard_title')}</h1>
      <p className="text-gray-500 mb-8">{t('tenant.welcome')}, {user?.name}.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">{t('tenant.your_unit')}</p>
          <p className="text-xl font-bold text-gray-900">{user?.unit_number || '—'}</p>
          <p className="text-sm text-gray-400">{user?.building_name}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">{t('tenant.monthly_rent')}</p>
          <p className="text-xl font-bold text-gray-900">
            {user?.rent_amount ? formatCurrency(user.rent_amount) : '—'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">{t('tenant.payment_status')}</p>
          <Badge
            label={latest?.status === 'paid' ? t('tenant.paid') : t('tenant.unpaid')}
            variant={latest?.status === 'paid' ? 'green' : 'red'}
          />
          {unpaidCount > 0 && (
            <p className="text-xs text-red-500 mt-1">{unpaidCount} unpaid invoice(s)</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
