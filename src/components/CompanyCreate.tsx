import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Building2, Upload, Palette, AlertCircle, Users, GitBranch, Plus, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiRequest } from "@/utils/apiUtils"
import { Navigate } from "react-router-dom"

type Props = {}

type Role = {
  id: string
  name: string
}

type HierarchyNode = {
  id: string
  name: string
  parent: string | null // Cambiado de number a string
  quantity: number
}

const MAX_USERS = 500

const CompanyCreate = (props: Props) => {
  const [viewForm, setViewForm] = useState(false)
  const [colorPage, setColorPage] = useState("#1E88E5")
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

  const [currentStep, setCurrentStep] = useState(1)
  const [companyId, setCompanyId] = useState<string | null>(null)

  const [roles, setRoles] = useState<Role[]>([{ id: "1", name: "" }])
  const [hierarchyNodes, setHierarchyNodes] = useState<HierarchyNode[]>([])
  const [newNodeName, setNewNodeName] = useState("")
  const [selectedParent, setSelectedParent] = useState<string | null>(null) // Cambiado a string
  const [newNodeQuantity, setNewNodeQuantity] = useState(1)

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm()

  const getTotalUsers = () => hierarchyNodes.reduce((sum, node: any) => sum + node.quantity, 0)

  const rolesForm = useForm()

  const hierarchiesForm = useForm()

  const onSubmit = async (values: any) => {
    const formData = new FormData()
    formData.append("name", values.name)
    formData.append("color", values.color)

    if (values.file && values.file[0]) {
      formData.append("file", values.file[0])
    }

    setLoading(true)
    setErro("")
    try {
      const response = await apiRequest("/companies/create", "POST", formData)
      setLoading(false)
      if (response?.id) {
        setCompanyId(response.id)
      }
      setCurrentStep(2)
    } catch (error) {
      setErro((error as Error).message)
      setLoading(false)
    }
  }

  const onSubmitRoles = async () => {
    const validRoles = roles.filter((role) => role.name.trim() !== "")

    if (validRoles.length === 0) {
      setErro("Debes agregar al menos un rol")
      return
    }

    setLoading(true)
    setErro("")
    try {
      const response = await apiRequest("/role/create", "POST", {
        company: companyId,
        name: validRoles.map((r) => ({ name: r.name })),
      })
      setLoading(false)
      setCurrentStep(3)
    } catch (error) {
      setErro((error as Error).message)
      setLoading(false)
    }
  }

  const onSubmitHierarchies = async () => {
    if (hierarchyNodes.length === 0) {
      setErro("Debes agregar al menos una jerarquía")
      return
    }

    setLoading(true)
    try {
      // Transformamos los datos antes de enviarlos
      const jerarquiasParaEnviar = hierarchyNodes.map((h) => {
        // Buscamos el nodo padre en la lista local usando el ID guardado en h.parent
        const nodoPadre = hierarchyNodes.find((n) => n.id === h.parent)

        return {
          name: h.name,
          // Si tiene padre, enviamos su NOMBRE, si no, enviamos null (o "null" según pida tu API)
          parent: nodoPadre ? nodoPadre.name : null,
          quantity: h.quantity
        }
      })

      await apiRequest("/hierarchy/create", "POST", {
        company: companyId,
        jerarquias: jerarquiasParaEnviar,
      })

      setLoading(false)
      // Ejemplo: redirigir tras éxito
      // alert("Empresa creada con éxito")
    } catch (error) {
      setErro((error as Error).message)
      setLoading(false)
    }
  }

  const addRole = () => {
    setRoles([...roles, { id: Date.now().toString(), name: "" }])
  }

  const removeRole = (id: string) => {
    if (roles.length > 1) {
      setRoles(roles.filter((role) => role.id !== id))
    }
  }

  const updateRole = (id: string, name: string) => {
    setRoles(roles.map((role) => (role.id === id ? { ...role, name } : role)))
  }

  const addHierarchyNode = () => {
    if (!newNodeName.trim()) {
      setErro("El nombre del nodo es requerido")
      return
    }

    // Validar que el nombre no esté duplicado (importante para que el mapa en Java no falle)
    if (hierarchyNodes.some(n => n.name.toLowerCase() === newNodeName.trim().toLowerCase())) {
      setErro("Ya existe un nivel con este nombre")
      return
    }

    const newNode: HierarchyNode = {
      id: Date.now().toString(), // ID único para el front
      name: newNodeName.trim(),
      parent: selectedParent ? selectedParent : null, // Aquí selectedParent guardará el NOMBRE
      quantity: newNodeQuantity || 1
    }

    setHierarchyNodes([...hierarchyNodes, newNode])
    setNewNodeName("")
    setSelectedParent(null) // Resetear
    setNewNodeQuantity(1)
    setErro("")
  }

  const removeHierarchyNode = (id: string) => {
    const nodeToDelete = hierarchyNodes.find(n => n.id === id);
    if (!nodeToDelete) return;

    const getChildrenIds = (parentName: string): string[] => {
      const children = hierarchyNodes.filter((n) => n.parent === parentName)
      return children.reduce((acc, child) => [...acc, child.id, ...getChildrenIds(child.name)], [] as string[])
    }

    const idsToRemove = [id, ...getChildrenIds(nodeToDelete.name)]
    setHierarchyNodes(hierarchyNodes.filter((n) => !idsToRemove.includes(n.id)))
  }


  const updateNodeQuantity = (id: string, quantity: number) => {
    const node = hierarchyNodes.find((n) => n.id === id)
    if (!node) return

    const otherNodesTotal = hierarchyNodes.filter((n) => n.id !== id).reduce((sum, n) => sum + n.quantity, 0)
    const newQuantity = Math.min(Math.max(1, quantity), MAX_USERS - otherNodesTotal)

    setHierarchyNodes(hierarchyNodes.map((n) => (n.id === id ? { ...n, quantity: newQuantity } : n)))
  }

  const getRootNodes = () => hierarchyNodes.filter((n) => n.parent === null)

  const getChildren = (parentId: string | null) =>
    hierarchyNodes.filter((n) => n.parent === parentId);

  const HierarchyTree = ({ node, level = 0 }: { node: HierarchyNode; level?: number }) => {
    const children = getChildren(node.id)
    const hasChildren = children.length > 0

    return (
      <div className="flex flex-col items-center relative">
        {/* Nodo Actual */}
        <div
          className="relative p-3 rounded-lg border shadow-md min-w-[140px] text-center bg-white z-10"
          style={{ borderTop: `4px solid ${colorPage}` }}
        >
          <p className="text-sm font-bold text-slate-800">{node.name}</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Users className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] font-medium text-slate-500">{node.quantity}</span>
          </div>
        </div>

        {/* Renderizado de Hijos con conectores */}
        {hasChildren && (
          <div className="relative pt-6 flex justify-center gap-4">
            {/* Línea vertical que sale del padre hacia abajo */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-slate-300"
            />

            {children.map((child, index) => (
              <div key={child.id} className="relative pt-6">
                {/* Línea horizontal que conecta a los hermanos */}
                {children.length > 1 && (
                  <div
                    className="absolute top-0 h-px bg-slate-300"
                    style={{
                      left: index === 0 ? "50%" : "0",
                      right: index === children.length - 1 ? "50%" : "0",
                    }}
                  />
                )}
                {/* Línea vertical corta que entra al hijo */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-slate-300" />

                <HierarchyTree node={child} level={level + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${currentStep >= step ? "text-white" : "bg-slate-200 text-slate-500"
              }`}
            style={{ backgroundColor: currentStep >= step ? colorPage : undefined }}
          >
            {currentStep > step ? <Check className="w-4 h-4" /> : step}
          </div>
          {step < 3 && (
            <div
              className={`w-12 h-1 mx-1 rounded transition-all duration-300 ${currentStep > step ? "" : "bg-slate-200"
                }`}
              style={{ backgroundColor: currentStep > step ? colorPage : undefined }}
            />
          )}
        </div>
      ))}
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="shadow-2xl border-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardHeader className="space-y-2 pb-6">
              <StepIndicator />
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md transition-all duration-300"
                  style={{ backgroundColor: colorPage }}
                >
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Crear Empresa</CardTitle>
                  <CardDescription>Paso 1: Configura la identidad visual de tu empresa</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {erro && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{erro}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2 text-base">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    Nombre de la Empresa
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ej: Mi Empresa S.A."
                    className="h-11"
                    {...register("name", { required: true })}
                  />
                  {errors.name && (
                    <span className="text-sm text-red-500 flex items-center gap-1">Este campo es obligatorio</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo" className="flex items-center gap-2 text-base">
                    <Upload className="w-4 h-4 text-slate-500" />
                    Logo de la Empresa
                  </Label>
                  <div className="flex flex-col gap-3">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      className="h-11 cursor-pointer"
                      {...register("file")}
                      onChange={(e) => {
                        register("file").onChange(e)
                        handleLogoChange(e)
                      }}
                    />
                    {logoPreview && (
                      <div className="flex items-center gap-3 p-3 border-2 border-dashed rounded-lg bg-slate-50">
                        <img
                          src={logoPreview || "/placeholder.svg"}
                          alt="Preview"
                          className="w-16 h-16 object-contain rounded"
                        />
                        <span className="text-sm text-slate-600">Vista previa del logo</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color" className="flex items-center gap-2 text-base">
                    <Palette className="w-4 h-4 text-slate-500" />
                    Color Corporativo
                  </Label>
                  <div className="flex gap-3 items-center">
                    <Input
                      id="color"
                      type="color"
                      className="h-11 w-20 cursor-pointer"
                      {...register("color", { required: true })}
                      onChange={HandleColor}
                      defaultValue={colorPage}
                    />
                    <div className="flex-1 flex items-center gap-2 px-4 py-2.5 border rounded-lg bg-slate-50">
                      <div
                        className="w-6 h-6 rounded border-2 border-white shadow-sm"
                        style={{ backgroundColor: colorPage }}
                      />
                      <span className="text-sm font-mono text-slate-700">{colorPage}</span>
                    </div>
                  </div>
                  {errors.color && <span className="text-sm text-red-500">Este campo es obligatorio</span>}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setViewForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                    style={{ backgroundColor: colorPage, borderColor: colorPage }}
                  >
                    {loading ? "Creando..." : "Siguiente"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card className="shadow-2xl border-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardHeader className="space-y-2 pb-6">
              <StepIndicator />
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md transition-all duration-300"
                  style={{ backgroundColor: colorPage }}
                >
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Crear Roles</CardTitle>
                  <CardDescription>Paso 2: Define los roles de tu empresa</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {erro && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{erro}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {roles.map((role, index) => (
                    <div key={role.id} className="flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder={`Rol ${index + 1} (ej: Administrador, Gerente...)`}
                        value={role.name}
                        onChange={(e) => updateRole(role.id, e.target.value)}
                        className="h-11 flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeRole(role.id)}
                        disabled={roles.length === 1}
                        className="h-11 w-11"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button type="button" variant="outline" onClick={addRole} className="w-full bg-transparent">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Rol
                </Button>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      setErro("")
                      setCurrentStep(1)
                    }}
                  >
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    disabled={loading}
                    onClick={onSubmitRoles}
                    className="flex-1 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                    style={{ backgroundColor: colorPage, borderColor: colorPage }}
                  >
                    {loading ? "Guardando..." : "Siguiente"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 3:
        const totalUsers = getTotalUsers()
        return (
          <Card className="shadow-2xl border-0 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl">
            <CardHeader className="space-y-2 pb-6">
              <StepIndicator />
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md transition-all duration-300"
                  style={{ backgroundColor: colorPage }}
                >
                  <GitBranch className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Crear Jerarquías</CardTitle>
                  <CardDescription>Paso 3: Construye tu organigrama visual</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {erro && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{erro}</p>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 border">
                  <span className="text-sm font-medium text-slate-700">Total de usuarios:</span>
                  <span className={`text-lg font-bold ${totalUsers >= MAX_USERS ? "text-red-600" : "text-slate-800"}`}>
                    {totalUsers} / {MAX_USERS}
                  </span>
                </div>

                <div className="p-4 border-2 border-dashed rounded-lg bg-slate-50 space-y-4">
                  <h3 className="font-medium text-slate-700">Agregar nuevo nivel</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="text"
                      placeholder="Nombre del nivel (ej: Dirección, Gerencia...)"
                      value={newNodeName}
                      onChange={(e) => setNewNodeName(e.target.value)}
                      className="h-11 flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Cantidad"
                      min={1}
                      max={MAX_USERS - totalUsers}
                      value={newNodeQuantity}
                      onChange={(e) =>
                        setNewNodeQuantity(
                          Math.max(1, Math.min(MAX_USERS - totalUsers, Number.parseInt(e.target.value) || 1)),
                        )
                      }
                      className="h-11 w-24"
                    />
                    <select
                      value={selectedParent || ""}
                      onChange={(e) => setSelectedParent(e.target.value || null)}
                      className="..."
                    >
                      <option value="">Sin padre (nivel raíz)</option>
                      {hierarchyNodes.map((node) => (
                        <option key={node.id} value={node.id}> {/* Usamos ID como valor */}
                          {node.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      onClick={addHierarchyNode}
                      className="h-11 text-white"
                      style={{ backgroundColor: colorPage }}
                      disabled={totalUsers >= MAX_USERS}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </div>

                {hierarchyNodes.length > 0 && (
                  <div className="p-4 border rounded-lg bg-white space-y-3">
                    <h3 className="font-medium text-slate-700 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Jerarquías y Cantidades
                    </h3>
                    <div className="space-y-2">
                      {hierarchyNodes.map((node) => {
                        const parentNode = hierarchyNodes.find((n) => n.id === node.parent)
                        return (
                          <div
                            key={node.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-slate-50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorPage }} />
                              <div>
                                <span className="font-medium text-slate-800">{node.name}</span>
                                {parentNode && (
                                  <span className="text-xs text-slate-500 ml-2">(Supervisado por {parentNode.name})</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs text-slate-500">Cantidad:</Label>
                              <Input
                                type="number"
                                min={1}
                                max={MAX_USERS - getTotalUsers() + node.quantity}
                                value={node.quantity}
                                onChange={(e) => updateNodeQuantity(node.id, Number.parseInt(e.target.value) || 1)}
                                className="h-8 w-20 text-center"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeHierarchyNode(node.id)}
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Organigrama visual */}
                <div className="min-h-[200px] p-6 border rounded-lg bg-white overflow-x-auto">
                  {hierarchyNodes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[200px] text-slate-400">
                      <GitBranch className="w-12 h-12 mb-3 opacity-50" />
                      <p>Agrega niveles para construir tu organigrama</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      {getRootNodes().map((rootNode) => (
                        <HierarchyTree key={rootNode.id} node={rootNode} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      setErro("")
                      setCurrentStep(2)
                    }}
                  >
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    disabled={loading || hierarchyNodes.length === 0}
                    onClick={onSubmitHierarchies}
                    className="flex-1 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                    style={{ backgroundColor: colorPage, borderColor: colorPage }}
                  >
                    {loading ? "Finalizando..." : "Finalizar"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  const HandleColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColorPage(e.target.value)
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div
      className="min-h-screen p-4 md:p-8 transition-all duration-700 flex items-center justify-center"
      style={{
        backgroundImage: `linear-gradient(135deg, ${colorPage}15 0%, ${colorPage}05 50%, #ffffff 100%)`,
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-4xl">
        {!viewForm ? (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-teal-600 shadow-lg mb-4">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent leading-tight">
                Bienvenido a tu Empresa
              </h1>
              <p className="text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
                Comienza a construir la identidad de tu empresa en solo unos pasos.
              </p>
            </div>
            <Button
              size="lg"
              className="mt-6 bg-gradient-to-r from-blue-500 to-teal-600 hover:from-blue-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
              onClick={() => setViewForm(true)}
            >
              <Building2 className="mr-2 h-5 w-5" />
              Iniciar Configuración
            </Button>
          </div>
        ) : (
          renderStepContent()
        )}
      </div>
    </div>
  )
}

export default CompanyCreate
