import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { getAllInvoices, createInvoice, updateStatus, downloadInvoicePdf } from '../../api/invoices.js'
import { getUsers } from '../../api/users.js'
import { formatCurrency, monthName } from '../../utils/formatters.js'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

export default function AdminInvoices() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language?.startsWith('de') ? 'de' : 'en'
  const [invoices, setInvoices] = useState([])
  const [users, setUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ tenant_id: '', month: new Date().getMonth() + 1, year: currentYear, rent_amount: '', extras: [] })
  const [extraLabel, setExtraLabel] = useState('')
  const [extraAmount, setExtraAmount] = useState('')

  const load = () => Promise.all([getAllInvoices(), getUsers()]).then(([inv, usr]) => { setInvoices(inv); setUsers(usr) })

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    const total = parseFloat(form.rent_amount) + form.extras.reduce((s, x) => s + x.amount, 0)
    await createInvoice({ ...form, rent_amount: parseFloat(form.rent_amount), total })
    setShowModal(false)
    setForm({ tenant_id: '', month: new Date().getMonth() + 1, year: currentYear, rent_amount: '', extras: [] })
    load()
  }

  const handleStatusToggle = async (inv) => {
    await updateStatus(inv.id, inv.status === 'paid' ? 'unpaid' : 'paid')
    load()
  }

  const handleDownload = async (id) => {
    const res = await downloadInvoicePdf(id, true)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `rechnung-${id}.pdf`; a.click()
    URL.revokeObjectURL(url)
  }

  const addExtra = () => {
    if (!extraLabel || !extraAmount) return
    setForm(f => ({ ...f, extras: [...f.extras, { label: extraLabel, amount: parseFloat(extraAmount) }] }))
    setExtraLabel(''); setExtraAmount('')
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.invoices_title')}</h1>
        <button onClick={() => setShowModal(true)} className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + {t('admin.generate_invoice')}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              {[t('admin.tenant'), t('admin.month'), t('admin.year'), t('admin.total'), t('admin.status'), ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.map(inv => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-800">{inv.tenant_name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{monthName(inv.month, lang)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{inv.year}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(inv.total)}</td>
                <td className="px-4 py-3">
                  <Badge label={inv.status === 'paid' ? t('tenant.paid') : t('tenant.unpaid')} variant={inv.status === 'paid' ? 'green' : 'red'} />
                </td>
                <td className="px-4 py-3 flex gap-3">
                  <button onClick={() => handleStatusToggle(inv)} className="text-xs text-primary-600 hover:text-primary-800 font-medium">
                    {inv.status === 'paid' ? t('admin.mark_unpaid') : t('admin.mark_paid')}
                  </button>
                  <button onClick={() => handleDownload(inv.id)} className="text-xs text-gray-500 hover:text-gray-700 font-medium">PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={t('admin.generate_invoice')} onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.tenant')}</label>
              <select required value={form.tenant_id} onChange={e => setForm(f => ({ ...f, tenant_id: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">— Select tenant —</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.month')}</label>
                <select value={form.month} onChange={e => setForm(f => ({ ...f, month: parseInt(e.target.value) }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {MONTHS.map(m => <option key={m} value={m}>{monthName(m, lang)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.year')}</label>
                <select value={form.year} onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.rent_amount')} (€)</label>
              <input required type="number" step="0.01" value={form.rent_amount} onChange={e => setForm(f => ({ ...f, rent_amount: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.extras')} (Nebenkosten)</label>
              <div className="flex gap-2 mb-2">
                <input placeholder="Label" value={extraLabel} onChange={e => setExtraLabel(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <input placeholder="€" type="number" step="0.01" value={extraAmount} onChange={e => setExtraAmount(e.target.value)} className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <button type="button" onClick={addExtra} className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm">+</button>
              </div>
              {form.extras.map((x, i) => (
                <div key={i} className="flex justify-between text-xs text-gray-600 px-1">
                  <span>{x.label}</span><span>{formatCurrency(x.amount)}</span>
                </div>
              ))}
            </div>
            <button type="submit" className="mt-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">{t('common.submit')}</button>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  )
}
