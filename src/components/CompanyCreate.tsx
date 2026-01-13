"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { Building2, Upload, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Props = {}

const CompanyCreate = (props: Props) => {
  const [viewForm, setViewForm] = React.useState(false)
  const [colorPage, setColorPage] = React.useState("#1E88E5")
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null)
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm()

  const onSubmit = (values: any) => console.log(values)

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
      <div className="w-full max-w-2xl">
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
          <Card className="shadow-2xl border-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardHeader className="space-y-2 pb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md transition-all duration-300"
                  style={{ backgroundColor: colorPage }}
                >
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Crear Empresa</CardTitle>
                  <CardDescription>Configura la identidad visual de tu empresa</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                      {...register("logoUrl")}
                      onChange={(e) => {
                        register("logoUrl").onChange(e)
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
                    className="flex-1 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                    style={{
                      backgroundColor: colorPage,
                      borderColor: colorPage,
                    }}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Crear Empresa
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default CompanyCreate
