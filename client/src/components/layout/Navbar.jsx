import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext.jsx'
import LanguageSwitcher from './LanguageSwitcher.jsx'

export default function Navbar() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-0.5">
            <span className="text-2xl font-bold text-primary-700">Real</span>
            <span className="text-2xl font-bold text-gray-800">Estate</span>
          </Link>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-600">
              <Link to="/" className="hover:text-primary-600 transition-colors">{t('nav.home')}</Link>
              <Link to="/properties" className="hover:text-primary-600 transition-colors">{t('nav.properties')}</Link>
              <Link to="/faq" className="hover:text-primary-600 transition-colors">{t('nav.faq')}</Link>
            </div>

            <LanguageSwitcher />

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="text-sm font-medium text-primary-600 hover:text-primary-800"
                >
                  {t('nav.dashboard')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md font-medium text-gray-700 transition-colors"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
