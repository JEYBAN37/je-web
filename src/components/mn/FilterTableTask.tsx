import { ClipboardCheck } from 'lucide-react'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { ca } from 'date-fns/locale';
import { apiRequest } from '@/utils/apiUtils';

const FilterTableTask = () => {

    const [searchTitle, setSearchTitle] = useState<string>('');
    const [status, setStatus] = useState<string>('');
    const [priority, setPriority] = useState<string>('');
    const [createAt, setcreateAt] = useState<string>('');
    const [data, setdata] = useState<any>([]);
    const [loading, setLoading] = useState(false)

    const getParameters = (e: any, data : Dispatch<SetStateAction<string>>) => {
        data( e.target.value );    
        console.log(e.target.value);
        return [];
    }

    const searchTask = async () => {
        // Lógica para buscar tareas fijas según los parámetros
        console.log('Buscando tareas con:', { searchTitle, status, priority, createAt });

        let createRequest = '';
        if (createAt) {
            createRequest = createAt;
        }
        // con params en la petición


        try
        {
            const response = await apiRequest('/tasks/all', 'GET',null);
            setdata(response);
            console.log("Respuesta de la búsqueda de tareas fijas:", response);
            setLoading(true);
            // Aquí iría la llamada a la API o la lógica para filtrar las tareas
        }catch(error){
            console.error("Error al buscar tareas fijas:", error);
        }
        setLoading(false);
        return [];
    }
    


    return (
        <div className="bg-card rounded-lg border border-border mx-5 shadow-lg p-6 mb-8">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <ClipboardCheck className="w-6 h-6 text-primary" />
                    </div>
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-foreground mb-2">Metas</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Las actividades fijas son aquellas que no deben adherirse a un cronograma específico, pero que son importantes para el seguimiento y la gestión del equipo.
                    </p>
                </div>
            </div>
            <Card className="border-border animate-in fade-in-0 slide-in-from-top-2 duration-200">
                <CardContent className="px-4 pb-4 pt-0">

                    // necesito un input de busqueda para filtrar las tareas fijas por titulo
                    <input type="text" placeholder='Buscar tareas por título' onChange={getParameters} />
                    <select
                        id="status"
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onChange={getParameters}
                    >
                        <option value="">Seleccione un estado</option>
                        <option value="pending">Pendiente</option>
                        <option value="in_progress">En Progreso</option>
                        <option value="completed">Completada</option>
                    </select>
                    <select
                      id="priority"
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onChange={getParameters}
                    >
                      <option value="">Seleccione una prioridad</option>
                      <option value="L">Baja</option>
                      <option value="M">Media</option>
                      <option value="H">Alta</option>
                    </select>

                    createAt;
                    <input type="date" onChange={getParameters} />

                    <input type="date" multiple onChange={getParameters} />


                    <div className="space-y-4">
                    {loading ? (
                        <p>Cargando tareas...</p>
                    ) : (
                        data.length === 0 ? (
                            <p>No se encontraron tareas.</p>
                        ) : (
                            data.map((task: any) => (
                                <div key={task.id} className="p-4 border border-border rounded-lg">
                                    <h3 className="text-lg font-semibold">{task.title}</h3>
                                    <p className="text-sm text-muted-foreground">{task.description}</p>
                                    <p className="text-sm">Estado: {task.status}</p>
                                    <p className="text-sm">Prioridad: {task.priority}</p>
                                </div>
                            ))
                        )
                    )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default FilterTableTask