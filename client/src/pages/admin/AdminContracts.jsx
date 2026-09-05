import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { getAllContracts, uploadContract } from '../../api/contracts.js'
import { getUsers } from '../../api/users.js'
import { formatDate } from '../../utils/formatters.js'

export default function AdminContracts() {
  const { t } = useTranslation()
  const [contracts, setContracts] = useState([])
  const [users, setUsers] = useState([])
  const [selectedTenant, setSelectedTenant] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const load = () => Promise.all([getAllContracts(), getUsers()]).then(([c, u]) => { setContracts(c); setUsers(u) })

  useEffect(() => { load() }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    const file = fileRef.current.files[0]
    if (!file || !selectedTenant) return
    setUploading(true)
    try {
      await uploadContract(selectedTenant, file)
      setSelectedTenant('')
      fileRef.current.value = ''
      load()
    } finally {
      setUploading(false)
    }
  }

  const contractMap = Object.fromEntries(contracts.map(c => [c.tenant_id, c]))

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.contracts_title')}</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 max-w-lg">
        <h2 className="font-semibold text-gray-800 mb-3">{t('admin.upload_contract')}</h2>
        <form onSubmit={handleUpload} className="flex flex-col gap-3">
          <select required value={selectedTenant} onChange={e => setSelectedTenant(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">— Select tenant —</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <input required ref={fileRef} type="file" accept=".pdf" className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
          <button type="submit" disabled={uploading} className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
            {uploading ? t('common.loading') : t('admin.upload_contract')}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              {[t('admin.name'), t('admin.email'), t('admin.contracts_title'), t('admin.uploaded')].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => {
              const c = contractMap[u.id]
              return (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{u.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-sm">
                    {c ? <span className="text-green-600 font-medium">✓ Uploaded</span> : <span className="text-gray-400">{t('admin.no_contract')}</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{c ? formatDate(c.uploaded_at) : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}
