import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language?.startsWith('de') ? 'de' : 'en'

  const toggle = () => i18n.changeLanguage(current === 'en' ? 'de' : 'en')

  return (
    <button
      onClick={toggle}
      className="text-xs font-semibold border border-gray-300 rounded px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
    >
      {current === 'en' ? 'DE' : 'EN'}
    </button>
  )
}
