import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { getMyContract, downloadMyContract } from '../../api/contracts.js'
import { formatDate } from '../../utils/formatters.js'

export default function TenantContract() {
  const { t } = useTranslation()
  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyContract().then(setContract).catch(() => setContract(null)).finally(() => setLoading(false))
  }, [])

  const handleDownload = async () => {
    const res = await downloadMyContract()
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mietvertrag.pdf'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('tenant.contract_title')}</h1>
      <p className="text-gray-500 mb-6">{t('tenant.contract_subtitle')}</p>

      {loading ? (
        <p className="text-gray-400">{t('common.loading')}</p>
      ) : !contract ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 text-sm">
          {t('tenant.no_contract')}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">📄</span>
            <div>
              <p className="font-semibold text-gray-900">Mietvertrag</p>
              <p className="text-xs text-gray-400">{t('admin.uploaded')}: {formatDate(contract.uploaded_at)}</p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            {t('tenant.download_contract')}
          </button>
        </div>
      )}
    </DashboardLayout>
  )
}
