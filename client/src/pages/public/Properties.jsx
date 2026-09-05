import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import PublicLayout from '../../components/layout/PublicLayout.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { getBuildings, getUnits } from '../../api/properties.js'
import { formatCurrency } from '../../utils/formatters.js'

function UnitCard({ unit, t }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <span className="font-semibold text-gray-800">{t('properties.unit')} {unit.unit_number}</span>
        <Badge
          label={unit.is_available ? t('properties.available') : t('properties.occupied')}
          variant={unit.is_available ? 'green' : 'red'}
        />
      </div>
      {unit.floor != null && (
        <p className="text-sm text-gray-500">{t('properties.floor')}: {unit.floor}</p>
      )}
      {unit.description && (
        <p className="text-sm text-gray-500 mt-1">{unit.description}</p>
      )}
      <p className="mt-3 text-primary-700 font-bold text-lg">
        {formatCurrency(unit.rent_amount)}<span className="text-sm font-normal text-gray-400"> {t('properties.per_month')}</span>
      </p>
    </div>
  )
}

function BuildingSection({ building, t }) {
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUnits(building.id)
      .then(setUnits)
      .finally(() => setLoading(false))
  }, [building.id])

  return (
    <div className="mb-12">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">{building.name}</h2>
        <p className="text-sm text-gray-500">{building.address}</p>
        {building.description && <p className="text-sm text-gray-600 mt-1">{building.description}</p>}
      </div>
      {loading ? (
        <p className="text-sm text-gray-400">{t('common.loading')}</p>
      ) : units.length === 0 ? (
        <p className="text-sm text-gray-400">{t('properties.no_units')}</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {units.map(unit => <UnitCard key={unit.id} unit={unit} t={t} />)}
        </div>
      )}
    </div>
  )
}

export default function Properties() {
  const { t } = useTranslation()
  const [buildings, setBuildings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBuildings().then(setBuildings).finally(() => setLoading(false))
  }, [])

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">{t('properties.title')}</h1>
          <p className="text-gray-500 mt-1">{t('properties.subtitle')}</p>
        </div>
        {loading ? (
          <p className="text-gray-400">{t('common.loading')}</p>
        ) : (
          buildings.map(b => <BuildingSection key={b.id} building={b} t={t} />)
        )}
      </div>
    </PublicLayout>
  )
}
