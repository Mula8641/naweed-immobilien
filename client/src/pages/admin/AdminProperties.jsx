import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { getBuildings, getUnits, createBuilding, createUnit, updateUnit, deleteUnit, deleteBuilding } from '../../api/properties.js'
import { formatCurrency } from '../../utils/formatters.js'

export default function AdminProperties() {
  const { t } = useTranslation()
  const [buildings, setBuildings] = useState([])
  const [unitsByBuilding, setUnitsByBuilding] = useState({})
  const [modal, setModal] = useState(null) // 'building' | 'unit' | 'editUnit'
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [buildingForm, setBuildingForm] = useState({ name: '', address: '', description: '' })
  const [unitForm, setUnitForm] = useState({ unit_number: '', floor: '', rent_amount: '', description: '', is_available: true })

  const load = async () => {
    const bs = await getBuildings()
    setBuildings(bs)
    const map = {}
    await Promise.all(bs.map(async b => { map[b.id] = await getUnits(b.id) }))
    setUnitsByBuilding(map)
  }

  useEffect(() => { load() }, [])

  const handleAddBuilding = async (e) => {
    e.preventDefault()
    await createBuilding(buildingForm)
    setBuildingForm({ name: '', address: '', description: '' })
    setModal(null)
    load()
  }

  const handleAddUnit = async (e) => {
    e.preventDefault()
    await createUnit({ ...unitForm, building_id: selectedBuilding, floor: unitForm.floor || null, rent_amount: parseFloat(unitForm.rent_amount) })
    setUnitForm({ unit_number: '', floor: '', rent_amount: '', description: '', is_available: true })
    setModal(null)
    load()
  }

  const handleEditUnit = async (e) => {
    e.preventDefault()
    await updateUnit(selectedUnit.id, { ...unitForm, floor: unitForm.floor || null, rent_amount: parseFloat(unitForm.rent_amount) })
    setModal(null)
    load()
  }

  const openEdit = (unit) => {
    setSelectedUnit(unit)
    setUnitForm({ unit_number: unit.unit_number, floor: unit.floor ?? '', rent_amount: unit.rent_amount, description: unit.description ?? '', is_available: !!unit.is_available })
    setModal('editUnit')
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.properties_title')}</h1>
        <button onClick={() => setModal('building')} className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + {t('admin.add_building')}
        </button>
      </div>

      {buildings.map(b => (
        <div key={b.id} className="mb-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-gray-50">
            <div>
              <h2 className="font-semibold text-gray-900">{b.name}</h2>
              <p className="text-xs text-gray-500">{b.address}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setSelectedBuilding(b.id); setModal('unit') }} className="text-xs bg-primary-50 text-primary-700 hover:bg-primary-100 px-3 py-1.5 rounded-md font-medium">
                + {t('admin.add_unit')}
              </button>
              <button onClick={async () => { if (window.confirm(t('common.confirm_delete'))) { await deleteBuilding(b.id); load() } }} className="text-xs text-red-500 hover:text-red-700 font-medium px-2">
                {t('admin.delete')}
              </button>
            </div>
          </div>
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr>
                {[t('admin.unit'), t('properties.floor'), t('properties.rent'), t('properties.available'), ''].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(unitsByBuilding[b.id] || []).map(unit => (
                <tr key={unit.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm font-medium text-gray-800">{unit.unit_number}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{unit.floor ?? '—'}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">{formatCurrency(unit.rent_amount)}</td>
                  <td className="px-4 py-2"><Badge label={unit.is_available ? t('properties.available') : t('properties.occupied')} variant={unit.is_available ? 'green' : 'red'} /></td>
                  <td className="px-4 py-2 flex gap-3">
                    <button onClick={() => openEdit(unit)} className="text-xs text-primary-600 hover:text-primary-800 font-medium">{t('admin.edit')}</button>
                    <button onClick={async () => { if (window.confirm(t('common.confirm_delete'))) { await deleteUnit(unit.id); load() } }} className="text-xs text-red-500 hover:text-red-700 font-medium">{t('admin.delete')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {modal === 'building' && (
        <Modal title={t('admin.add_building')} onClose={() => setModal(null)}>
          <form onSubmit={handleAddBuilding} className="flex flex-col gap-3">
            {[{ label: 'Name', key: 'name' }, { label: 'Address', key: 'address' }, { label: 'Description (optional)', key: 'description' }].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input required={key !== 'description'} value={buildingForm[key]} onChange={e => setBuildingForm(f => ({ ...f, [key]: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            ))}
            <button type="submit" className="mt-1 bg-primary-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700">{t('admin.save')}</button>
          </form>
        </Modal>
      )}

      {(modal === 'unit' || modal === 'editUnit') && (
        <Modal title={modal === 'unit' ? t('admin.add_unit') : t('admin.edit')} onClose={() => setModal(null)}>
          <form onSubmit={modal === 'unit' ? handleAddUnit : handleEditUnit} className="flex flex-col gap-3">
            {[{ label: 'Unit Number', key: 'unit_number' }, { label: 'Floor (optional)', key: 'floor' }, { label: 'Rent Amount (€)', key: 'rent_amount' }, { label: 'Description (optional)', key: 'description' }].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input required={key === 'unit_number' || key === 'rent_amount'} value={unitForm[key]} onChange={e => setUnitForm(f => ({ ...f, [key]: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            ))}
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={unitForm.is_available} onChange={e => setUnitForm(f => ({ ...f, is_available: e.target.checked }))} className="rounded" />
              Available
            </label>
            <button type="submit" className="mt-1 bg-primary-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700">{t('admin.save')}</button>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  )
}
