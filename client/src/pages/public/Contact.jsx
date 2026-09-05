import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PublicLayout from '../../components/layout/PublicLayout.jsx'

const EMAIL = 'info@naweedrealestate.de'
const PHONE = '+49123456789'
const PHONE_DISPLAY = '+49 123 456 789'
const WA_NUMBER = '49123456789'

export default function Contact() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const unit = params.get('unit')
  const building = params.get('building')

  const context = unit && building ? `${t('properties.unit')} ${unit} – ${building}` : null

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [sent, setSent] = useState(false)

  const waText = encodeURIComponent(
    context
      ? `Hallo, ich interessiere mich für ${context}. Könnten Sie mir bitte weitere Informationen zukommen lassen?`
      : 'Hallo, ich habe eine Anfrage bezüglich Ihrer Immobilien.'
  )

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    const subject = encodeURIComponent(context ? `Anfrage: ${context}` : 'Kontaktanfrage')
    const body = encodeURIComponent(
      `Name: ${form.name}\nE-Mail: ${form.email}\nTelefon: ${form.phone}\n\n${form.message}${context ? `\n\nAnfrage zu: ${context}` : ''}`
    )
    window.open(`mailto:${EMAIL}?subject=${subject}&body=${body}`)
    setSent(true)
  }

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/properties" className="text-sm text-primary-600 hover:underline flex items-center gap-1 mb-4">
            ← {t('common.back')} {t('nav.properties')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t('contact.title')}</h1>
          {context && (
            <div className="mt-3 inline-flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-800 text-sm font-medium px-4 py-2 rounded-full">
              <span className="text-primary-400">🏠</span> {context}
            </div>
          )}
          <p className="text-gray-500 mt-3">{t('contact.subtitle')}</p>
        </div>

        {/* Quick contact cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {/* Email card */}
          <a
            href={`mailto:${EMAIL}?subject=${encodeURIComponent(context ? `Anfrage: ${context}` : 'Kontaktanfrage')}`}
            className="group flex items-start gap-4 bg-white border border-gray-200 hover:border-primary-300 hover:shadow-md rounded-2xl p-5 transition-all"
          >
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              ✉️
            </div>
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-primary-700">{t('contact.email_label')}</p>
              <p className="text-sm text-primary-600 mt-0.5">{EMAIL}</p>
              <p className="text-xs text-gray-400 mt-1">{t('contact.email_hint')}</p>
            </div>
          </a>

          {/* WhatsApp card */}
          <a
            href={`https://wa.me/${WA_NUMBER}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-4 bg-white border border-gray-200 hover:border-green-300 hover:shadow-md rounded-2xl p-5 transition-all"
          >
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              💬
            </div>
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-green-700">{t('contact.whatsapp_label')}</p>
              <p className="text-sm text-green-600 mt-0.5">{PHONE_DISPLAY}</p>
              <p className="text-xs text-gray-400 mt-1">{t('contact.whatsapp_hint')}</p>
            </div>
          </a>
        </div>

        {/* Contact form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">{t('contact.form_title')}</h2>

          {sent ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">✅</div>
              <p className="font-semibold text-gray-900 text-lg">{t('contact.sent_title')}</p>
              <p className="text-gray-500 text-sm mt-1">{t('contact.sent_subtitle')}</p>
              <button
                onClick={() => setSent(false)}
                className="mt-6 text-sm text-primary-600 hover:underline"
              >
                {t('contact.send_another')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.name')} *</label>
                  <input
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                    placeholder="Max Mustermann"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.phone')}</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                    placeholder="+49 …"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.email')} *</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="max@beispiel.de"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.message')} *</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                  placeholder={t('contact.message_placeholder')}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {t('contact.submit')}
              </button>
              <p className="text-xs text-gray-400 text-center">{t('contact.form_note')}</p>
            </form>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
