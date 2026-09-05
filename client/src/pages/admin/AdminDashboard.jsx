import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import { getUsers } from '../../api/users.js'
import { getAllInvoices } from '../../api/invoices.js'
import { getBuildings, getUnits } from '../../api/properties.js'

export default function AdminDashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState({ tenants: 0, unpaid: 0, totalUnits: 0, occupiedUnits: 0 })

  useEffect(() => {
    Promise.all([getUsers(), getAllInvoices(), getBuildings()]).then(async ([users, invoices, buildings]) => {
      const allUnits = (await Promise.all(buildings.map(b => getUnits(b.id)))).flat()
      setStats({
        tenants: users.length,
        unpaid: invoices.filter(i => i.status === 'unpaid').length,
        totalUnits: allUnits.length,
        occupiedUnits: allUnits.filter(u => !u.is_available).length,
      })
    }).catch(() => {})
  }, [])

  const occupancy = stats.totalUnits > 0
    ? Math.round((stats.occupiedUnits / stats.totalUnits) * 100) + '%'
    : '—'

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('admin.dashboard_title')}</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('admin.total_tenants')} value={stats.tenants} />
        <StatCard label={t('admin.unpaid_invoices')} value={stats.unpaid} />
        <StatCard label={t('admin.occupancy_rate')} value={occupancy} sub={`${stats.occupiedUnits} / ${stats.totalUnits} units`} />
        <StatCard label={t('admin.total_units')} value={stats.totalUnits} />
      </div>
    </DashboardLayout>
  )
}
