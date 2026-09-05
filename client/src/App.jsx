import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ProtectedRoute } from './routes/ProtectedRoute.jsx'

// Public pages
import Home       from './pages/public/Home.jsx'
import Properties from './pages/public/Properties.jsx'
import FAQ        from './pages/public/FAQ.jsx'
import Login      from './pages/public/Login.jsx'
import Contact    from './pages/public/Contact.jsx'

// Tenant pages
import TenantDashboard from './pages/tenant/TenantDashboard.jsx'
import TenantInvoices  from './pages/tenant/TenantInvoices.jsx'
import TenantContract  from './pages/tenant/TenantContract.jsx'

// Admin pages
import AdminDashboard  from './pages/admin/AdminDashboard.jsx'
import AdminUsers      from './pages/admin/AdminUsers.jsx'
import AdminProperties from './pages/admin/AdminProperties.jsx'
import AdminInvoices   from './pages/admin/AdminInvoices.jsx'
import AdminContracts  from './pages/admin/AdminContracts.jsx'
import AdminFAQ        from './pages/admin/AdminFAQ.jsx'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/"           element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/faq"        element={<FAQ />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/contact"    element={<Contact />} />

        {/* Tenant */}
        <Route path="/dashboard" element={<ProtectedRoute role="tenant"><TenantDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/invoices" element={<ProtectedRoute role="tenant"><TenantInvoices /></ProtectedRoute>} />
        <Route path="/dashboard/contract" element={<ProtectedRoute role="tenant"><TenantContract /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin"            element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users"      element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/properties" element={<ProtectedRoute role="admin"><AdminProperties /></ProtectedRoute>} />
        <Route path="/admin/invoices"   element={<ProtectedRoute role="admin"><AdminInvoices /></ProtectedRoute>} />
        <Route path="/admin/contracts"  element={<ProtectedRoute role="admin"><AdminContracts /></ProtectedRoute>} />
        <Route path="/admin/faq"        element={<ProtectedRoute role="admin"><AdminFAQ /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
