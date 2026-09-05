import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { getFaqs, createFaq, deleteFaq } from '../../api/faq.js'

const emptyForm = { question_en: '', answer_en: '', question_de: '', answer_de: '' }

export default function AdminFAQ() {
  const { t } = useTranslation()
  const [faqs, setFaqs] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const load = () => getFaqs().then(setFaqs)
  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    await createFaq(form)
    setForm(emptyForm)
    setShowModal(false)
    load()
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirm_delete'))) return
    await deleteFaq(id)
    load()
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.faq_title')}</h1>
        <button onClick={() => setShowModal(true)} className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + {t('admin.add_faq')}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {faqs.map(faq => (
          <div key={faq.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">EN: {faq.question_en}</p>
                <p className="text-xs text-gray-400 mt-0.5">DE: {faq.question_de}</p>
              </div>
              <button onClick={() => handleDelete(faq.id)} className="text-xs text-red-500 hover:text-red-700 font-medium ml-4">{t('admin.delete')}</button>
            </div>
            <p className="text-sm text-gray-600 mt-1">{faq.answer_en}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title={t('admin.add_faq')} onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            {[
              { label: t('admin.question_en'), key: 'question_en', multi: false },
              { label: t('admin.answer_en'),   key: 'answer_en',   multi: true  },
              { label: t('admin.question_de'), key: 'question_de', multi: false },
              { label: t('admin.answer_de'),   key: 'answer_de',   multi: true  },
            ].map(({ label, key, multi }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                {multi ? (
                  <textarea required rows={2} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                ) : (
                  <input required value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                )}
              </div>
            ))}
            <button type="submit" className="mt-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">{t('common.submit')}</button>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  )
}
