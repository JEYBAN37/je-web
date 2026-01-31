import * as React from "react"
import { Check, ChevronsUpDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export interface MultiSelectOption {
  value: string
  label: string
  description?: string
  sublabel?: string
  icon?: React.ReactNode
}

interface MultiSelectSearchProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  maxDisplayedBadges?: number
  className?: string
  disabled?: boolean
}

export function MultiSelectSearch({
  options,
  selected,
  onChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron resultados",
  maxDisplayedBadges = 3,
  className,
  disabled = false,
}: MultiSelectSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options
    const searchLower = search.toLowerCase()
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchLower) ||
        option.description?.toLowerCase().includes(searchLower) ||
        option.sublabel?.toLowerCase().includes(searchLower)
    )
  }, [options, search])

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const handleSelectAll = () => {
    const filteredValues = filteredOptions.map((o) => o.value)
    const allFilteredSelected = filteredValues.every((v) => selected.includes(v))
    
    if (allFilteredSelected) {
      // Deseleccionar todos los filtrados
      onChange(selected.filter((v) => !filteredValues.includes(v)))
    } else {
      // Seleccionar todos los filtrados
      const newSelected = [...new Set([...selected, ...filteredValues])]
      onChange(newSelected)
    }
  }

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selected.filter((v) => v !== value))
  }

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
  }

  const selectedOptions = options.filter((o) => selected.includes(o.value))
  const filteredValues = filteredOptions.map((o) => o.value)
  const allFilteredSelected = filteredValues.length > 0 && filteredValues.every((v) => selected.includes(v))
  const someFilteredSelected = filteredValues.some((v) => selected.includes(v))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between h-auto min-h-10 px-3 py-2",
            className
          )}
        >
          <div className="flex flex-wrap gap-1.5 flex-1">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground font-normal">{placeholder}</span>
            ) : selectedOptions.length <= maxDisplayedBadges ? (
              selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {option.label}
                  <button
                    type="button"
                    className="ml-1 rounded-full outline-none hover:bg-muted-foreground/20 p-0.5"
                    onClick={(e) => handleRemove(option.value, e)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <Badge variant="secondary">
                {selectedOptions.length} seleccionados
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            {selectedOptions.length > 0 && (
              <button
                type="button"
                className="p-1 rounded-full hover:bg-muted"
                onClick={handleClearAll}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        {/* Barra de busqueda */}
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        {/* Seleccionar todos */}
        <div className="p-2 border-b">
          <button
            type="button"
            className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors"
            onClick={handleSelectAll}
          >
            <Checkbox
              checked={allFilteredSelected}
              className={cn(
                someFilteredSelected && !allFilteredSelected && "opacity-50"
              )}
            />
            <span>
              {allFilteredSelected ? "Deseleccionar todos" : "Seleccionar todos"} ({filteredOptions.length})
            </span>
          </button>
        </div>

        {/* Lista de opciones */}
        <div className="max-h-[280px] overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center">
              {emptyMessage}
            </p>
          ) : (
            <div className="p-1">
              {filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "flex items-start gap-3 w-full p-2 rounded-md text-left transition-colors",
                    selected.includes(option.value)
                      ? "bg-primary/10"
                      : "hover:bg-muted"
                  )}
                  onClick={() => handleToggle(option.value)}
                >
                  <Checkbox
                    checked={selected.includes(option.value)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <span className="text-sm font-medium truncate">
                        {option.label}
                      </span>
                    </div>
                    {option.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {option.description}
                      </p>
                    )}
                    {option.sublabel && (
                      <p className="text-xs text-muted-foreground truncate">
                        {option.sublabel}
                      </p>
                    )}
                  </div>
                  {selected.includes(option.value) && (
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}