import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import PublicLayout from '../../components/layout/PublicLayout.jsx'
import { getFaqs } from '../../api/faq.js'

function AccordionItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        className="w-full text-left px-5 py-4 font-medium text-gray-800 flex justify-between items-center hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span>{question}</span>
        <span className="text-gray-400 text-lg">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50">
          {answer}
        </div>
      )}
    </div>
  )
}

export default function FAQ() {
  const { t, i18n } = useTranslation()
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const lang = i18n.language?.startsWith('de') ? 'de' : 'en'

  useEffect(() => {
    getFaqs().then(setFaqs).finally(() => setLoading(false))
  }, [])

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">{t('faq.title')}</h1>
          <p className="text-gray-500 mt-2">{t('faq.subtitle')}</p>
        </div>
        {loading ? (
          <p className="text-gray-400 text-center">{t('common.loading')}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {faqs.map(faq => (
              <AccordionItem
                key={faq.id}
                question={lang === 'de' ? faq.question_de : faq.question_en}
                answer={lang === 'de' ? faq.answer_de : faq.answer_en}
              />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
