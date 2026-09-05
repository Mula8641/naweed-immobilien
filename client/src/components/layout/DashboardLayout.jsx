import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function DashboardLayout({ children }) {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar role={user?.role} />
        <main className="flex-1 p-6 bg-gray-50 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
