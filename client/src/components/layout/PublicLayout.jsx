import Navbar from './Navbar.jsx'

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="bg-gray-800 text-gray-400 text-center text-sm py-6">
        © {new Date().getFullYear()} RealEstate. All rights reserved.
      </footer>
    </div>
  )
}
