import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PublicLayout from '../../components/layout/PublicLayout.jsx'

export default function Home() {
  const { t } = useTranslation()

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{t('home.hero_title')}</h1>
          <p className="text-lg text-primary-100 mb-8">{t('home.hero_subtitle')}</p>
          <Link
            to="/properties"
            className="inline-block bg-accent hover:bg-yellow-500 text-white font-semibold px-8 py-3 rounded-lg transition-colors text-sm"
          >
            {t('home.browse_btn')}
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">{t('home.features_title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '📍', title: t('home.feature1_title'), desc: t('home.feature1_desc') },
              { icon: '💶', title: t('home.feature2_title'), desc: t('home.feature2_desc') },
              { icon: '📄', title: t('home.feature3_title'), desc: t('home.feature3_desc') },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3">{icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
