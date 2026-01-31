import type React from "react"

import { useState } from "react"
import { Menu, X, LogOut, Home, Users, Building2, BarChart3, FileText, Outdent } from "lucide-react"
import { Outlet, useNavigate } from "react-router-dom"

export interface CompanyProps {
  colorCompany: string
  logoCompany: string
}

export const AdminLayout = ({
  company,
  children,
}: {
  company: CompanyProps
  children?: React.ReactNode
}) => {
  const navigate = useNavigate(); // Inicializas el hook
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeRoute, setActiveRoute] = useState("/dashboard")

  const logout = () => {
    localStorage.clear()
    window.location.href = "/login"
  }

  const navigationItems = [
    { path: "/dashboard", label: "Inicio", icon: Home },
    { path: "/usuarios", label: "Gestión Usuarios", icon: Users },
    { path: "/asignar-actividades", label: "Asignar Actividades", icon: Building2 },
    { path: "/actividades", label: "Supervisar", icon: BarChart3 },
    { path: "/reportes", label: "Reportes Generales", icon: FileText },
  ]

  const handleNavClick = (path: string) => {
    setActiveRoute(path)
    setIsSidebarOpen(false)
    navigate(path)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        style={{ backgroundColor: company.colorCompany }}
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } flex flex-col shadow-2xl`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden backdrop-blur-sm">
                <img
                  src="https://www.vhv.rs/dpng/d/283-2832831_logos-de-empresas-de-computadoras-png-download-logo.png"
                  alt="Company Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-white font-semibold text-lg">{localStorage.getItem('nameCompany')}</h1>
                <p className="text-white/60 text-xs">Sistema de Gestión</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-white/80 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeRoute === item.path

            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${isActive
                    ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 lg:px-8 py-4 flex items-center justify-between shadow-sm">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <Menu size={24} className="text-foreground" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden md:flex flex-col items-end">
              <p className="text-sm font-medium text-foreground">{localStorage.getItem('nameUser')}</p>
              <p className="text-xs text-muted-foreground">{localStorage.getItem('role')} / {localStorage.getItem('hierarchy')}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-sm">A</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
