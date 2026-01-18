"use client"

import { apiRequest } from "@/utils/apiUtils"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { User, FileText, ChevronDown, ChevronUp, Upload, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export interface Role {
  id: number
  name: string
}

export interface hierarchy {
  nombre: string
  plazas: number
  ocupadas: number
  disponibles: number
}

export interface user {
  id: number
  username: string
  nombreCompleto: string
  cedula: string
  telefono: string
  contrato: string
  active: boolean
  role: Role
  hierarchyNode: hierarchy
  fechaInicioContrato: string
  fechaTerminoContrato: string
  objeto: string
  contratistaTipoIdentificacion: string
  numeroSupervisor: string
  nombreSupervisor: string
  pagado: number
  valorContratado: number
  idRecurso: number
  saldo: number
}

export interface GestorUsersProps {
  roles: Role[]
  functionsAvailable: string[]
  hierarchies: hierarchy[]
  users: user[]
}

const GestorUsers = () => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm()

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<GestorUsersProps | null>(null)
  const [expandedUser, setExpandedUser] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const idCompany = typeof window !== "undefined" ? localStorage.getItem("idCompany") : null
  const colorCompany = typeof window !== "undefined" ? localStorage.getItem("colorCompany") || "#10b981" : "#10b981"
  const [erro, setErro] = useState<string>("")
  const [csvFile, setCsvFile] = useState<File | null>(null)

  const dataUsers = async () => {
    setLoading(true)
    try {
      const response: GestorUsersProps = await apiRequest(`/user/parameters/${idCompany}`, "GET", null)
      console.log("response users", response)
      setData(response)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const onSubmit = async (values: any) => {
    if (!csvFile) {
      setErro("Por favor seleccione un archivo CSV")
      return
    }

    const formData = new FormData()
    formData.append("fileContent", csvFile)

    setLoading(true)
    setErro("")
    try {
      const response = await apiRequest("/user/upload-csv", "POST", formData)
      console.log("CSV uploaded:", response)
      await dataUsers()
    } catch (error) {
      setErro((error as Error).message)
    }
    setLoading(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0])
    }
  }

  const toggleUser = (userId: number) => {
    setExpandedUser(expandedUser === userId ? null : userId)
  }

  const filteredUsers = data?.users?.filter(
    (user) =>
      user.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cedula.includes(searchTerm),
  )

  React.useEffect(() => {
    dataUsers()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-bold text-foreground mb-2">Gestor de Usuarios</h1>
        <p className="text-muted-foreground">Administra los usuarios, plazas y roles de tu empresa</p>
      </div>

      {/* Reference Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hierarchies Table */}
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="bg-muted px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Plazas por Nivel Jerárquico
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Referencia para asignación de usuarios</p>
          </div>
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-muted/50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nombre del Nivel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Plazas Disponibles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Plazas Ocupadas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Plazas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.hierarchies?.map((hierarchy, index) => (
                  <tr key={index} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">{hierarchy.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                        {hierarchy.disponibles || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/10 text-secondary">
                        {hierarchy.ocupadas || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                        {hierarchy.plazas}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Roles Table */}
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="bg-muted px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Roles Disponibles
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Referencia para asignación de permisos</p>
          </div>
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-muted/50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nombre del Rol
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.roles?.map((role) => (
                  <tr key={role.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                        {role.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">{role.name}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CSV Upload Section */}
      <div className="bg-card rounded-lg border border-border shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground mb-2">Carga Masiva de Usuarios</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Sube un archivo CSV con los datos de los usuarios. El formato será validado en el servidor.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-foreground mb-2">Archivo CSV</label>
                  <div className="relative">
                    <Input type="file" accept=".csv" onChange={handleFileChange} className="cursor-pointer" />
                  </div>
                  {csvFile && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>{csvFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setCsvFile(null)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <Button 
                  type="submit" 
                  disabled={!csvFile || loading} 
                  className="whitespace-nowrap"
                  style={{ backgroundColor: colorCompany }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Cargar Usuarios
                </Button>
              </div>
              {erro && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                  {erro}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Users List Section */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="bg-muted px-6 py-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Listado de Usuarios
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{filteredUsers?.length || 0} usuarios registrados</p>
            </div>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nombre, usuario o cédula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
          {filteredUsers?.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No se encontraron usuarios</p>
            </div>
          ) : (
            filteredUsers?.map((user) => (
              <div key={user.id} className="hover:bg-muted/30 transition-colors">
                {/* User Row */}
                <div className="px-6 py-4 cursor-pointer" onClick={() => toggleUser(user.id)}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Avatar Placeholder */}
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-foreground truncate">{user.nombreCompleto}</h3>
                          {user.active ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              Inactivo
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                          <span>@{user.username}</span>
                          <span>•</span>
                          <span>{user.role?.name || "Sin rol"}</span>
                          <span>•</span>
                          <span>{user.hierarchyNode?.nombre || "Sin jerarquía"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expand Icon */}
                    <div className="flex-shrink-0">
                      {expandedUser === user.id ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedUser === user.id && (
                  <div className="px-6 pb-6 bg-muted/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                      {/* Profile Photo Section */}
                      <div className="col-span-1">
                        <div className="bg-card rounded-lg border border-border p-4">
                          <h4 className="text-sm font-medium text-foreground mb-3">Foto de Perfil</h4>
                          <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center mx-auto">
                            <User className="w-16 h-16 text-muted-foreground" />
                          </div>
                          <p className="text-xs text-muted-foreground text-center mt-2">No disponible</p>
                        </div>
                      </div>

                      {/* Personal Info */}
                      <div className="col-span-1 md:col-span-2 lg:col-span-2">
                        <div className="bg-card rounded-lg border border-border p-4">
                          <h4 className="text-sm font-medium text-foreground mb-3">Información Personal</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Cédula</p>
                              <p className="font-medium text-foreground">{user.cedula}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Teléfono</p>
                              <p className="font-medium text-foreground">{user.telefono}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Tipo Identificación</p>
                              <p className="font-medium text-foreground">{user.contratistaTipoIdentificacion}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">ID Recurso</p>
                              <p className="font-medium text-foreground">{user.idRecurso}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contract Info */}
                      <div className="col-span-1 md:col-span-2 lg:col-span-2">
                        <div className="bg-card rounded-lg border border-border p-4">
                          <h4 className="text-sm font-medium text-foreground mb-3">Información de Contrato</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Número de Contrato</p>
                              <p className="font-medium text-foreground">{user.contrato}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Objeto</p>
                              <p className="font-medium text-foreground">{user.objeto}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Fecha Inicio</p>
                              <p className="font-medium text-foreground">
                                {new Date(user.fechaInicioContrato).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Fecha Término</p>
                              <p className="font-medium text-foreground">
                                {new Date(user.fechaTerminoContrato).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Financial Info */}
                      <div className="col-span-1">
                        <div className="bg-card rounded-lg border border-border p-4">
                          <h4 className="text-sm font-medium text-foreground mb-3">Información Financiera</h4>
                          <div className="space-y-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Valor Contratado</p>
                              <p className="font-medium text-foreground">${user.valorContratado?.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Pagado</p>
                              <p className="font-medium text-foreground">${user.pagado?.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Saldo</p>
                              <p className="font-medium text-foreground">${user.saldo?.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Supervisor Info */}
                      <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <div className="bg-card rounded-lg border border-border p-4">
                          <h4 className="text-sm font-medium text-foreground mb-3">Información del Supervisor</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Nombre del Supervisor</p>
                              <p className="font-medium text-foreground">{user.nombreSupervisor}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Número del Supervisor</p>
                              <p className="font-medium text-foreground">{user.numeroSupervisor}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default GestorUsers
