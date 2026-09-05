import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { getMyInvoices, downloadInvoicePdf } from '../../api/invoices.js'
import { formatCurrency, monthName } from '../../utils/formatters.js'

export default function TenantInvoices() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language?.startsWith('de') ? 'de' : 'en'
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyInvoices().then(setInvoices).finally(() => setLoading(false))
  }, [])

  const handleDownload = async (id) => {
    const res = await downloadInvoicePdf(id, false)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rechnung-${id}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('tenant.invoices_title')}</h1>
      <p className="text-gray-500 mb-6">{t('tenant.invoices_subtitle')}</p>

      {loading ? (
        <p className="text-gray-400">{t('common.loading')}</p>
      ) : invoices.length === 0 ? (
        <p className="text-gray-400">{t('tenant.no_invoices')}</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {[t('tenant.invoice_month'), t('tenant.invoice_year'), t('tenant.invoice_total'), t('tenant.invoice_status'), ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">{monthName(inv.month, lang)}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{inv.year}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(inv.total)}</td>
                  <td className="px-4 py-3">
                    <Badge
                      label={inv.status === 'paid' ? t('tenant.paid') : t('tenant.unpaid')}
                      variant={inv.status === 'paid' ? 'green' : 'red'}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDownload(inv.id)}
                      className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                    >
                      {t('tenant.download_pdf')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  )
}
