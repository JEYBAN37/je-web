import { apiRequest } from '@/utils/apiUtils'
import React, { useState, useCallback, useMemo } from 'react'
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  CalendarIcon,
  Upload,
  X,
  FileText,
  ImageIcon,
  File,
  AlertCircle,
  ClipboardList,
  Users,
  Flag,
  Repeat,
  Paperclip,
  Search,
  CheckSquare,
  Square,
  User,
  Briefcase,
  Network,
  CalendarCheck,
  ClipboardCheck,
  Clock,
  MapPin
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { MultiSelectSearch } from './mn/MultiSelectOption'
import { create } from 'domain'
import { WeeklyCalendar } from './mn/WeeklyCalendar'
import FilterTableTask from './mn/FilterTableTask'

export interface HierarchyNodeTaskResponse {
  supervisores: NodeResponse[]
  subordinados: NodeResponse[]
}

export interface NodeResponse {
  id: string
  name: string
  idUser: string
  nombreCompleto: string
  roleName: string
}

interface FileWithPreview {
  file: File
  preview: string
  id: string
}

interface Multiselect {
  value: string
  label: string
  description?: string
  sublabel?: string
}

interface TaskFormValues {
  title: string
  description: string
  status: string
  priority: string
  recurrenceType?: string
  company?: number | null
  createdBy?: number | null
  approvalRequired?: number[]
  assignedNodes?: number[]
  startDate?: string | null
  endDate?: string | null
  createdAt?: string | null
  placeOrlocation?: string | null
  startTime?: string | null
  endTime?: string | null
}



const TaskManager = () => {
  const [subordinados, setSubordinados] = useState<Multiselect[]>([])
  const [supervisores, setSupervisores] = useState<Multiselect[]>([])
  const [recurrente, setRecurrente] = useState<boolean>(false)
  const [place, setPlace] = useState<boolean>(false)
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [selectedApprovers, setSelectedApprovers] = useState<string[]>([])
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
  const idCompany = typeof window !== "undefined" ? localStorage.getItem("idCompany") : null
  const colorCompany = typeof window !== "undefined" ? localStorage.getItem("colorCompany") || "#10b981" : "#10b981"
  const [successfullySubmitted, setSuccessfullySubmitted] = useState(false)
  const [tasks, setTasks] = useState<any[]>(['1', '2', '3'])
  const [startTime, setStartTime] = useState<string>("")
  const [endTime, setEndTime] = useState<string>("")

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm()

  const mapToMultiselect = (nodes: NodeResponse[]): Multiselect[] => {
    return nodes.map(node => ({
      value: node.id,
      label: node.name,
      description: node.roleName,
      sublabel: node.nombreCompleto
    }))
  }
  const getPropertiesFromHierarchy = async () => {
    setLoading(true)
    try {
      const response: HierarchyNodeTaskResponse = await apiRequest(`/hierarchy/nodes/user/2`, "GET", null)
      setSupervisores(mapToMultiselect(response.supervisores))
      setSubordinados(mapToMultiselect(response.subordinados))
    } catch (error) {
      console.error("Error fetching hierarchy nodes:", error)
    }
    setLoading(false)
  }

  const getTasks = async () => {
    setTasks([])
    setLoading(true)

  }

  React.useEffect(() => {
    getPropertiesFromHierarchy()

  }, [successfullySubmitted])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles) return

    const newFiles: FileWithPreview[] = Array.from(selectedFiles).map((file) => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      id: Math.random().toString(36).substring(7)
    }))

    setFiles((prev) => [...prev, ...newFiles])
    e.target.value = ''
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find(f => f.id === id)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter(f => f.id !== id)
    })
  }, [])

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
    if (file.type.includes('pdf')) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }


  const onSubmit = async (values: any) => {

    if (selectedApprovers.length === 0) {
      setErro("Debe seleccionar al menos un aprobador para la tarea.")
      return
    }

    //if (selectedAssignees.length === 0) {
    //setErro("Debe asignar al menos un empleado a la tarea.")
    //return
    //}

    const request: TaskFormValues = {
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      recurrenceType: recurrente ? values.recurrenceType : null,
      company: idCompany ? Number(idCompany) : null,
      createdBy: localStorage.getItem("idUser") ? Number(localStorage.getItem("idUser")) : null,
      approvalRequired: selectedApprovers.map(item =>
        typeof item === 'object' ? Number(item.id) : Number(item)
      ),
      assignedNodes: selectedAssignees.map(item =>
        typeof item === 'object' ? Number(item.id) : Number(item)
      ),
      startTime: startTime || null,
      endTime: endTime || null,
      startDate: startDate ? startDate.toISOString().split('T')[0] : null,
      endDate: endDate ? endDate.toISOString().split('T')[0] : null,
      createdAt: new Date().toISOString().split('T')[0],
      placeOrlocation: null
    }

    setLoading(true)
    setErro("")

    try {
      console.log("Submitting form data... ", request)
      let response: any = await apiRequest('/task/create', 'POST', request)

      const formData = new FormData()
      formData.append("taskId", response.id)
      files.forEach((f) => {
        formData.append("files", f.file)
      })

      if (files.length > 0)
        response = await apiRequest('/document/anexos', 'POST', formData)

      setSuccessfullySubmitted(response.message || "Tarea creada exitosamente.")

      // Reiniciar todos los valores
      reset()
      setSelectedApprovers([])
      setSelectedAssignees([])
      setStartDate(undefined)
      setEndDate(undefined)
      setFiles([])
      setRecurrente(false)
      setErro("")

    } catch (error) {
      setErro((error as Error).message)
    }
    setLoading(false)
  }

  if (loading && subordinados.length === 0) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 items-start"> {/* items-start evita que la card se estire a la fuerza */}
        <div className="flex-1 w-full">
          <Card className="border-border shadow-lg h-auto"> {/* h-auto es clave aquí */}
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ClipboardList className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-semibold text-foreground">
                    Nueva Actividad
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Crea y asigna una nueva actividad a tu equipo
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-auto overflow-visible"> {/* Evita overflow-hidden para que no corte sombras o popovers */}              {erro && (
              <div className="mb-6 p-2 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{erro}</p>
              </div>
            )
            }
              {successfullySubmitted && (
                <div className="mb-6 p-2 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
                  <CheckSquare className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-green-500">{successfullySubmitted}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Titulo y Descripcion */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Titulo de la tarea
                    </Label>
                    <Input
                      id="title"
                      placeholder="Ej: Revisar informe trimestral"
                      className={cn(
                        "h-11",
                        errors.title && "border-destructive focus-visible:ring-destructive"
                      )}
                      {...register("title", { required: true, maxLength: 100 })}
                    />
                    {errors.title && (
                      <p className="text-xs text-destructive">El titulo es requerido</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Descripcion
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe los detalles de la tarea..."
                      className={cn(
                        "min-h-24 resize-none",
                        errors.description && "border-destructive focus-visible:ring-destructive"
                      )}
                      {...register("description", { required: true, maxLength: 500 })}
                    />
                    {errors.description && (
                      <p className="text-xs text-destructive">La descripcion es requerida</p>
                    )}
                  </div>
                </div>

                {/* Estado y Prioridad */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium">
                      Estado inicial
                    </Label>
                    <select
                      id="status"
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      {...register("status", { required: true })}
                    >
                      <option value="">Seleccione un estado</option>
                      <option value="pending">Pendiente</option>
                      <option value="in_progress">En Progreso</option>
                      <option value="completed">Completada</option>
                    </select>
                    {errors.status && (
                      <p className="text-xs text-destructive">El estado es requerido</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-sm font-medium flex items-center gap-2">
                      <Flag className="h-4 w-4" />
                      Prioridad
                    </Label>
                    <select
                      id="priority"
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      {...register("priority", { required: true })}
                    >
                      <option value="">Seleccione una prioridad</option>
                      <option value="L">Baja</option>
                      <option value="M">Media</option>
                      <option value="H">Alta</option>
                    </select>
                    {errors.priority && (
                      <p className="text-xs text-destructive">La prioridad es requerida</p>
                    )}
                  </div>
                </div>

                {/* Fechas con Calendario */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Rango de fechas
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-11 w-full justify-start text-left font-normal bg-transparent",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP", { locale: es }) : "Fecha de inicio"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-11 w-full justify-start text-left font-normal bg-transparent",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP", { locale: es }) : "Fecha de fin"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          disabled={(date) => startDate ? date < startDate : false}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Horas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Hora inicio
                    </Label>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Hora fin
                    </Label>
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                {/* Aprobadores */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Requiere aprobacion de
                  </Label>

          

                  {errors.approvers && (
                    <p className="text-xs text-destructive">Debe seleccionar al menos un aprobador</p>
                  )}
                </div>

                {/* Asignados */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Asignar a
                  </Label>

                  <MultiSelectSearch
                    options={subordinados}
                    selected={selectedAssignees}
                    onChange={setSelectedAssignees}
                    placeholder="Seleccionar usuarios..."
                    searchPlaceholder="Buscar por nombre, rol o nodo..."
                  />
                  {errors.assignedNodes && (
                    <p className="text-xs text-destructive">Debe asignar al menos un usuario</p>
                  )}

                </div>

                {/* Recurrencia */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="recurrente"
                      checked={recurrente}
                      onCheckedChange={(checked) => setRecurrente(checked === true)}
                    />
                    <Label
                      htmlFor="recurrente"
                      className="text-sm font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <Repeat className="h-4 w-4" />
                      Tarea recurrente
                    </Label>
                  </div>

                  {recurrente && (
                    <div className="ml-7 space-y-2">
                      <Label htmlFor="recurrenceType" className="text-sm text-muted-foreground">
                        Frecuencia de repeticion
                      </Label>
                      <select
                        id="recurrenceType"
                        className="flex h-10 w-full sm:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        {...register("recurrenceType", { required: recurrente })}
                      >
                        <option value="D">Diaria</option>
                        <option value="W">Semanal</option>
                        <option value="M">Mensual</option>
                      </select>
                    </div>
                  )}
                </div>


                {/* Place */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="place"
                      checked={place}
                      onCheckedChange={(checked) => setPlace(checked === true)}
                    />
                    <Label
                      htmlFor="place"
                      className="text-sm font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <MapPin className="h-4 w-4" />
                      Lugar de la Actividad
                    </Label>
                  </div>

                  {place && (
                    <div className="ml-7 space-y-2">
                      <Label htmlFor="place" className="text-sm text-muted-foreground">
                        Lugar o Ubicación
                      </Label>
                      <Input
                        id="place"
                        placeholder="Ej: Microterrio / Oficina Principal"
                        className={cn(
                          "h-11",
                          errors.placeOrLocation && "border-destructive focus-visible:ring-destructive"
                        )}
                        {...register("placeOrLocation", { maxLength: 100 })}
                      />
                    </div>
                  )}
                </div>

                {/* Anexos */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Anexos
                  </Label>

                  <div className="border-2 border-dashed border-input rounded-lg p-6 transition-colors hover:border-primary/50">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="text-sm font-medium text-foreground">
                        Arrastra archivos aqui o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Imagenes, PDF, documentos (max. 10MB cada uno)
                      </p>
                    </label>
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {files.length} archivo{files.length !== 1 ? 's' : ''} seleccionado{files.length !== 1 ? 's' : ''}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {files.map((f) => (
                          <div
                            key={f.id}
                            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border group"
                          >
                            {f.preview ? (
                              <img
                                src={f.preview || "/placeholder.svg"}
                                alt={f.file.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                                {getFileIcon(f.file)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{f.file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(f.file.size)}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeFile(f.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Boton Submit */}
                <div className="pt-4 border-t border-border">
                  <Button
                    type="submit"
                    className="w-full sm:w-auto h-11 px-8 cursor-pointer text-white"
                    style={{ backgroundColor: colorCompany, borderColor: colorCompany }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Creando tarea...
                      </>
                    ) : (
                      'Crear Tarea'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="p-4 md:p-6">
          <Card className="border-border shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CalendarCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-semibold text-foreground">
                    Cronograma de Actividades
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Gestiona y edita las tareas existentes
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {erro && (
                <div className="mb-6 p-2 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{erro}</p>
                </div>
              )
              }
              {successfullySubmitted && (
                <div className="mb-6 p-2 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
                  <CheckSquare className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-green-500">{successfullySubmitted}</p>
                </div>
              )}


              {/* Aquí iría el calendario con las actividades */}

              <WeeklyCalendar />

              {
                tasks.length > 0 ? (

                  <div></div>
                )
                  : (

                    <div className="text-center py-20">
                      <ClipboardList className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Gestiona tus actividades</h3>
                      <p className="text-sm text-muted-foreground">
                        Aqui podras ver, editar y gestionar todas las tareas que has creado.
                      </p>
                    </div>
                  )
              }




            </CardContent>
          </Card>
        </div>
      </div>



    </div>
  )
}

export default TaskManager