import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { getUsers, createUser, deleteUser } from '../../api/users.js'
import { getBuildings, getUnits } from '../../api/properties.js'
import { formatDate } from '../../utils/formatters.js'

const emptyForm = { name: '', email: '', password: '', unit_id: '' }

export default function AdminUsers() {
  const { t } = useTranslation()
  const [users, setUsers] = useState([])
  const [buildings, setBuildings] = useState([])
  const [allUnits, setAllUnits] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const load = () => getUsers().then(setUsers)

  useEffect(() => {
    load()
    getBuildings().then(async (bs) => {
      setBuildings(bs)
      const units = (await Promise.all(bs.map(b => getUnits(b.id)))).flat()
      setAllUnits(units)
    })
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await createUser(form)
      setShowModal(false)
      setForm(emptyForm)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirm_delete'))) return
    await deleteUser(id)
    load()
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.users_title')}</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + {t('admin.add_user')}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              {[t('admin.name'), t('admin.email'), t('admin.unit'), t('admin.created'), ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-400">{t('admin.no_users')}</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{u.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{u.unit_number || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{formatDate(u.created_at)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(u.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">
                    {t('admin.delete_user')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={t('admin.add_user')} onClose={() => setShowModal(false)}>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            {[
              { label: t('admin.name'), key: 'name', type: 'text' },
              { label: t('admin.email'), key: 'email', type: 'email' },
              { label: t('login.password'), key: 'password', type: 'password' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type={type}
                  required
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.unit')} (optional)</label>
              <select
                value={form.unit_id}
                onChange={e => setForm(f => ({ ...f, unit_id: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">— None —</option>
                {allUnits.map(u => (
                  <option key={u.id} value={u.id}>Unit {u.unit_number} ({buildings.find(b => b.id === u.building_id)?.name})</option>
                ))}
              </select>
            </div>
            <button type="submit" className="mt-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
              {t('common.submit')}
            </button>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  )
}
