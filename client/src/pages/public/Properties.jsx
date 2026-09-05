import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import PublicLayout from '../../components/layout/PublicLayout.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { getBuildings, getUnits } from '../../api/properties.js'
import { formatCurrency } from '../../utils/formatters.js'

function UnitDetailModal({ unit, building, onClose, t }) {
  const facilities = unit.description
    ? unit.description.split('·').map(s => s.trim()).filter(Boolean)
    : []

  // Close on backdrop click
  const handleBackdrop = e => { if (e.target === e.currentTarget) onClose() }

  // Close on Escape
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Hero image */}
        <div className="relative h-72 overflow-hidden rounded-t-2xl bg-gray-200">
          {unit.image_url ? (
            <img src={unit.image_url} alt={unit.unit_number} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">🏠</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/40 hover:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center text-xl leading-none transition-colors"
          >
            &times;
          </button>
          {/* Rent badge on image */}
          <div className="absolute bottom-4 left-5 text-white">
            <p className="text-3xl font-bold">{formatCurrency(unit.rent_amount)}</p>
            <p className="text-sm text-white/80">{t('properties.per_month')}</p>
          </div>
        </div>

        <div className="p-6">
          {/* Header row */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{building.name}</p>
              <h2 className="text-xl font-bold text-gray-900">
                {t('properties.unit')} {unit.unit_number}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {unit.floor === 0
                  ? 'Erdgeschoss'
                  : `${unit.floor}. Obergeschoss`}
                {' · '}{building.address}
              </p>
            </div>
            <Badge
              label={unit.is_available ? t('properties.available') : t('properties.occupied')}
              variant={unit.is_available ? 'green' : 'red'}
            />
          </div>

          {/* Facilities */}
          {facilities.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                {t('properties.facilities')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {facilities.map((f, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 bg-primary-50 text-primary-800 text-sm px-3 py-1.5 rounded-full border border-primary-100"
                  >
                    <span className="text-primary-400">✓</span> {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          {unit.is_available ? (
            <a
              href={`mailto:info@realestate.de?subject=${encodeURIComponent(`Anfrage Wohnung ${unit.unit_number} – ${building.name}`)}`}
              className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {t('properties.enquire')}
            </a>
          ) : (
            <div className="w-full text-center bg-gray-100 text-gray-400 font-medium py-3 rounded-xl">
              {t('properties.occupied')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function UnitCard({ unit, building, onOpen, t }) {
  const facilities = unit.description
    ? unit.description.split('·').map(s => s.trim()).filter(Boolean).slice(0, 3)
    : []

  return (
    <div
      className="border border-gray-200 rounded-xl bg-white hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group"
      onClick={() => onOpen(unit)}
    >
      {/* Thumbnail */}
      <div className="h-44 overflow-hidden bg-gray-100">
        {unit.image_url ? (
          <img
            src={unit.image_url}
            alt={unit.unit_number}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">🏠</div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="font-semibold text-gray-900">{t('properties.unit')} {unit.unit_number}</span>
          <Badge
            label={unit.is_available ? t('properties.available') : t('properties.occupied')}
            variant={unit.is_available ? 'green' : 'red'}
          />
        </div>

        {/* Mini facilities */}
        {facilities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {facilities.map((f, i) => (
              <span key={i} className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                {f}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-end justify-between mt-1">
          <p className="text-primary-700 font-bold text-lg leading-tight">
            {formatCurrency(unit.rent_amount)}
            <span className="text-xs font-normal text-gray-400 ml-1">{t('properties.per_month')}</span>
          </p>
          <span className="text-xs text-primary-600 font-medium group-hover:underline">
            {t('properties.view_details')} →
          </span>
        </div>
      </div>
    </div>
  )
}

function BuildingSection({ building, t }) {
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUnit, setSelectedUnit] = useState(null)

  useEffect(() => {
    getUnits(building.id)
      .then(setUnits)
      .finally(() => setLoading(false))
  }, [building.id])

  const available = units.filter(u => u.is_available).length

  return (
    <>
      {selectedUnit && (
        <UnitDetailModal
          unit={selectedUnit}
          building={building}
          onClose={() => setSelectedUnit(null)}
          t={t}
        />
      )}

      <div className="mb-14 rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
        {/* Building hero */}
        {building.image_url && (
          <div className="relative h-56 overflow-hidden">
            <img
              src={building.image_url}
              alt={building.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-4 left-5 text-white">
              <h2 className="text-2xl font-bold">{building.name}</h2>
              <p className="text-sm text-white/80">{building.address}</p>
            </div>
            <div className="absolute top-4 right-4">
              <span className="bg-white/90 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                {available} {available === 1 ? t('properties.unit_available') : t('properties.units_available')}
              </span>
            </div>
          </div>
        )}

        {!building.image_url && (
          <div className="px-5 pt-5">
            <h2 className="text-xl font-bold text-gray-900">{building.name}</h2>
            <p className="text-sm text-gray-500">{building.address}</p>
          </div>
        )}

        {building.description && (
          <p className="text-sm text-gray-500 leading-relaxed px-5 pt-3">{building.description}</p>
        )}

        <div className="p-5">
          {loading ? (
            <p className="text-sm text-gray-400">{t('common.loading')}</p>
          ) : units.length === 0 ? (
            <p className="text-sm text-gray-400">{t('properties.no_units')}</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {units.map(unit => (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  building={building}
                  onOpen={setSelectedUnit}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
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
