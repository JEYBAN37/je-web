"use client"

import * as React from "react"
import { Calendar as CalendarIcon, Clock, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { apiRequest } from "@/utils/apiUtils"

export interface Task {
  id: string
  title: string
  description?: string
  createdAt: Date
  startDate: Date
  endDate: Date
  color?: string
}

interface WeeklyCalendarProps {
  onTaskClick?: (task: Task) => void
}

const FULL_DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
const SHORT_DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

const TASK_COLORS = [
  "bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-300",
  "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300",
  "bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300",
  "bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300",
  "bg-cyan-500/15 border-cyan-500 text-cyan-700 dark:text-cyan-300",
  "bg-indigo-500/15 border-indigo-500 text-indigo-700 dark:text-indigo-300",
]

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric"
  })
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short"
  })
}

function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = []
  const current = new Date(startDate)

  while (current <= endDate) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0]
}

function isDateInArray(date: Date, dateArray: Date[]): boolean {
  return dateArray.some(d => isSameDay(d, date))
}

export function WeeklyCalendar({ onTaskClick }: WeeklyCalendarProps) {
  const today = new Date()
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [loading, setLoading] = React.useState(true)
  const hierarchyId = localStorage.getItem('hierarchyId') || '';
  // Estado para el rango de fechas - por defecto el mes actual
  const [startDate, setStartDate] = React.useState<Date>(() => {
    const d = new Date(today.getFullYear(), today.getMonth(), 1)
    return d
  })
  const [endDate, setEndDate] = React.useState<Date>(() => {
    const d = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return d
  })

  // Ahora es un array de fechas seleccionadas
  const [selectedDates, setSelectedDates] = React.useState<Date[]>([])
  const [showFilter, setShowFilter] = React.useState(false)

  const datesInRange = getDatesInRange(startDate, endDate)

  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => isSameDay(new Date(task.startDate), date))
  }

  const getTaskColor = (taskId: string) => {
    const index = tasks.findIndex(t => t.id === taskId) % TASK_COLORS.length
    return TASK_COLORS[index]
  }

  // Toggle de seleccion de dia (agregar o quitar del array)
  const handleDayClick = (date: Date) => {
    setSelectedDates(prev => {
      const isAlreadySelected = isDateInArray(date, prev)
      if (isAlreadySelected) {
        return prev.filter(d => !isSameDay(d, date))
      } else {
        return [...prev, date].sort((a, b) => a.getTime() - b.getTime())
      }
    })
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value)
    if (!isNaN(newDate.getTime())) {
      setStartDate(newDate)
      setSelectedDates([])
    }
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value)
    if (!isNaN(newDate.getTime())) {
      setEndDate(newDate)
      setSelectedDates([])
    }
  }

  const clearSelection = () => {
    setSelectedDates([])
  }

  const selectAll = () => {
    setSelectedDates(datesInRange.filter(date => getTasksForDay(date).length > 0))
  }

  // Obtener todas las tareas de los dias seleccionados
  const selectedDatesTasks = selectedDates.flatMap(date =>
    getTasksForDay(date).map(task => ({ ...task, selectedDate: date }))
  ).sort((a, b) => {
    // Ordenar primero por fecha, luego por hora
    const dateCompare = a.selectedDate.getTime() - b.selectedDate.getTime()
    if (dateCompare !== 0) return dateCompare
    return a.startDate.getTime() - b.startDate.getTime()
  })

  // Agrupar tareas por fecha para mostrar en el listado
  const tasksByDate = selectedDates.map(date => ({
    date,
    tasks: getTasksForDay(date).sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
  }))

  // Agrupar fechas por semanas para mejor visualizacion
  const weeks: Date[][] = []
  let currentWeek: Date[] = []

  // Agregar dias vacios al inicio para alinear con el dia de la semana
  const firstDayOfWeek = datesInRange[0].getDay()
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(new Date(0)) // Fecha invalida como placeholder
  }

  datesInRange.forEach((date) => {
    currentWeek.push(date)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  // Agregar dias vacios al final si es necesario
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(new Date(0))
    }
    weeks.push(currentWeek)
  }

  // Cargar tareas de la API
  React.useEffect(() => {
    const fetchTasks = async () => {
      try {
        let finalStartDate = startDate.toISOString().split('T')[0];
        let finalEndDate = endDate.toISOString().split('T')[0];

        if (!finalStartDate) {
          const date = new Date();
          date.setDate(date.getDate() - 15);
          finalStartDate = date.toISOString().split('T')[0];
          setStartDate(new Date(finalStartDate));
        }

        if (!finalEndDate) {
          const date = new Date();
          finalEndDate = date.toISOString().split('T')[0];
          setEndDate(new Date(finalEndDate));
        }

        const params = new URLSearchParams();
        params.append('startDate', finalStartDate);
        params.append('endDate', finalEndDate);
        params.append('hierarchyId', hierarchyId);
        params.append('recurrence', 'true');
        
        const data = await apiRequest<Task[]>(`/task/all?${params.toString()}`, 'GET', null)
        console.log('Fetching tasks with params:', JSON.stringify(data));
        setTasks(data)
      } catch (error) {
        console.error('Error cargando tareas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [ startDate, endDate])
  return (
    <div className="space-y-4">
      {/* Selector de rango de fechas */}
      <Card className="border-border">
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium text-foreground">
                {startDate.toLocaleDateString("es-ES", { day: "numeric", month: "short" })} - {endDate.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
              </CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5 bg-transparent"
              onClick={() => setShowFilter(!showFilter)}
            >
              <Filter className="h-3 w-3" />
              Filtrar
            </Button>
          </div>

          {/* Panel de filtros */}
          {showFilter && (
            <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-3 animate-in fade-in-0 slide-in-from-top-1 duration-200">
              <div className="space-y-1.5">
                <Label htmlFor="start-date" className="text-xs text-muted-foreground">
                  Fecha inicio
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formatDateForInput(startDate)}
                  onChange={handleStartDateChange}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end-date" className="text-xs text-muted-foreground">
                  Fecha fin
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={formatDateForInput(endDate)}
                  onChange={handleEndDateChange}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="px-4 pb-4 pt-0">
          {/* Instrucciones */}
          <p className="text-xs text-muted-foreground mb-3">
            Haz clic en varios dias para ver todas sus tareas juntas
          </p>

          {/* Encabezados de dias de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {SHORT_DAYS.map((day) => (
              <div key={day} className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wide py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Grid de dias */}
          <div className="space-y-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((date, dayIndex) => {
                  // Verificar si es un placeholder (fecha invalida)
                  const isPlaceholder = date.getTime() === 0

                  if (isPlaceholder) {
                    return <div key={dayIndex} className="aspect-square" />
                  }

                  const dayTasks = getTasksForDay(date)
                  const isToday = isSameDay(date, today)
                  const isSelected = isDateInArray(date, selectedDates)
                  const hasTasks = dayTasks.length > 0

                  return (
                    <button
                      key={dayIndex}
                      onClick={() => handleDayClick(date)}
                      className={cn(
                        "aspect-square flex flex-col items-center justify-center rounded-lg transition-all cursor-pointer relative",
                        "hover:bg-muted/60",
                        isToday && !isSelected && "bg-primary/10 ring-1 ring-primary/30",
                        isSelected && "bg-primary text-primary-foreground",
                        hasTasks && !isSelected && "font-semibold"
                      )}
                    >
                      <span className={cn(
                        "text-sm",
                        isToday && !isSelected && "text-primary font-bold",
                        isSelected && "text-primary-foreground font-bold",
                        !isToday && !isSelected && hasTasks && "text-foreground"
                      )}>
                        {date.getDate()}
                      </span>

                      {/* Indicador de tareas */}
                      {hasTasks && (
                        <div className="absolute bottom-1 flex gap-0.5">
                          {dayTasks.slice(0, 3).map((_, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "w-1 h-1 rounded-full",
                                isSelected ? "bg-primary-foreground/70" : "bg-primary"
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Leyenda y acciones */}
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {selectedDates.length > 0 ? (
                <>
                  <Badge variant="secondary" className="text-xs">
                    {selectedDates.length} {selectedDates.length === 1 ? "dia" : "dias"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={clearSelection}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpiar
                  </Button>
                </>
              ) : (
                <span>{datesInRange.length} dias en el rango</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs px-2"
                onClick={selectAll}
              >
                Seleccionar con tareas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de actividades de los dias seleccionados */}
      {selectedDates.length > 0 && (
        <Card className="border-border animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-primary" />
                <div>
                  <CardTitle className="text-sm font-medium text-foreground">
                    Tareas de {selectedDates.length} {selectedDates.length === 1 ? "dia" : "dias"} seleccionados
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {formatShortDate(selectedDates[0])}
                    {selectedDates.length > 1 && ` - ${formatShortDate(selectedDates[selectedDates.length - 1])}`}
                  </p>
                </div>
              </div>
              {selectedDatesTasks.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {selectedDatesTasks.length} {selectedDatesTasks.length === 1 ? "tarea" : "tareas"}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="px-4 pb-4 pt-0">
            {selectedDatesTasks.length > 0 ? (
              <div className="space-y-4">
                {tasksByDate.map(({ date, tasks: dayTasks }) => (
                  dayTasks.length > 0 && (
                    <div key={date.toISOString()} className="space-y-2">
                      {/* Encabezado del dia */}
                      <div className="flex items-center gap-2 sticky top-0 bg-card py-1">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-xs font-medium text-muted-foreground px-2">
                          {FULL_DAYS[date.getDay()]} {date.getDate()}
                        </span>
                        <div className="h-px flex-1 bg-border" />
                      </div>

                      {/* Tareas del dia */}
                      {dayTasks.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => onTaskClick?.(task)}
                          className={cn(
                            "w-full text-left p-3 rounded-lg border-l-4 transition-all",
                            "hover:shadow-sm hover:scale-[1.01]",
                            getTaskColor(task.id)
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{task.title}</h4>
                              {task.description && (
                                <p className="text-xs mt-1 opacity-75 line-clamp-2">{task.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs opacity-75 shrink-0">
                              <Clock className="h-3 w-3" />
                              <span>{task.startTime} - {task.endTime}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Badge variant="secondary" className="mb-2">
                  Sin actividades
                </Badge>
                <p className="text-xs text-muted-foreground">
                  No hay tareas programadas para los dias seleccionados
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
