import { apiRequest } from '@/utils/apiUtils'
import React, { useState } from 'react'

export interface HierarchyNodeTaskResponse {
  supervisores: NodeResponse[],
  subordinados: NodeResponse[]
}

export interface NodeResponse {
  id: string
  name: string
  idUser: string
  nombreCompleto: string
}


const TaskManager = () => {

  const [subordinados, setSubordinados] = React.useState<NodeResponse[]>([])
  const [supervisores, setSupervisores] = React.useState<NodeResponse[]>([])
  const [loading, setLoading] = useState(false)

  const getPropertiesFromHierarchy = async () => {
    setLoading(true)
    try {
      const response: HierarchyNodeTaskResponse = await apiRequest(`/hierarchy/nodes/user/2`, "GET", null)
      console.log("response users", response)
      
      setSupervisores(response.supervisores)
      setSubordinados(response.subordinados)

    } catch (error) {
      console.error("Error fetching hierarchy nodes:", error);
    }
    setLoading(false)
  }

  React.useEffect(() => {
    getPropertiesFromHierarchy()
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
    <div>
      TaskManager
      <form >
        <input type="text" placeholder='titulo' />
        <input type="text" placeholder='descripcion' />
        <input type="text" placeholder='Tarea requiere aprobacion' />
        <select name="" id="">De queir requeire aprobacion traer los heracihvi</select>
        <input type="text" placeholder='Tipo de prioridad' />
        <input type="date" placeholder='fecha de inicio' />
        <input type="date" placeholder='fecha fin' />
        <input type="text" placeholder='reqeureiere adjunto' />
        <input type="file" placeholder='cargar anexo' />
        <input type="text" placeholder='es una tera repertitiva??' />
        <select>quien se le asigna que node filtors por cargos multiselcet  </select>

        <button type="submit">Agregar Tarea</button>

        {supervisores.map((sub) => (
          <div key={sub.id}>
            <p>{sub.name}</p>
          </div>
        ))}
      </form>
    </div>
  )
}

export default TaskManager