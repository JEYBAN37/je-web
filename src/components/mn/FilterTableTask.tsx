import { Calendar, ChartBarIncreasing, ChevronLeft, ChevronRight, ClipboardCheck, Search } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { apiRequest } from '@/utils/apiUtils';
import { Button } from '../ui/button';

const FilterTableTask = () => {
    // Estados para los filtros
    const [searchTitle, setSearchTitle] = useState('');
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const colorCompany = typeof window !== "undefined" ? localStorage.getItem("colorCompany") || "#10b981" : "#10b981"
    const hierarchyId = typeof window !== "undefined" ? localStorage.getItem("hierarchyId") || "1" : "1"

    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const mockTasks = [
        { id: 1, title: 'Tarea 1', description: 'Descripción tarea 1', priority: 'HIGH', status: 'PENDING', startDate: '2024-01-01', endDate: '2024-01-15' },
        { id: 2, title: 'Tarea 2', description: 'Descripción tarea 2', priority: 'MEDIUM', status: 'IN_PROGRESS', startDate: '2024-01-05', endDate: '2024-01-20' },
        { id: 3, title: 'Tarea 3', description: 'Descripción tarea 3', priority: 'LOW', status: 'DONE', startDate: '2024-01-02', endDate: '2024-01-10' },
        { id: 4, title: 'Tarea 4', description: 'Descripción tarea 4', priority: 'HIGH', status: 'PENDING', startDate: '2024-01-08', endDate: '2024-01-25' },
        { id: 5, title: 'Tarea 5', description: 'Descripción tarea 5', priority: 'MEDIUM', status: 'IN_PROGRESS', startDate: '2024-01-03', endDate: '2024-01-18' },
        { id: 6, title: 'Tarea 6', description: 'Descripción tarea 6', priority: 'LOW', status: 'DONE', startDate: '2024-01-06', endDate: '2024-01-22' },
        { id: 7, title: 'Tarea 7', description: 'Descripción tarea 7', priority: 'HIGH', status: 'PENDING', startDate: '2024-01-04', endDate: '2024-01-19' },
        { id: 8, title: 'Tarea 8', description: 'Descripción tarea 8', priority: 'MEDIUM', status: 'IN_PROGRESS', startDate: '2024-01-07', endDate: '2024-01-23' },
        { id: 9, title: 'Tarea 9', description: 'Descripción tarea 9', priority: 'LOW', status: 'DONE', startDate: '2024-01-09', endDate: '2024-01-26' },
        { id: 10, title: 'Tarea 10', description: 'Descripción tarea 10', priority: 'HIGH', status: 'PENDING', startDate: '2024-01-10', endDate: '2024-01-27' },
    ];

    const searchTask = async () => {
        setLoading(true);
        // Reiniciamos a la página 1 cada vez que se hace una búsqueda nueva
        setCurrentPage(1);

        try {
            let finalStartDate = startDate;
            let finalEndDate = endDate;

            if (!finalStartDate) {
                const date = new Date();
                date.setDate(date.getDate() - 15);
                finalStartDate = date.toISOString().split('T')[0];
                setStartDate(finalStartDate);
            }

            if (!finalEndDate) {
                const date = new Date();
                finalEndDate = date.toISOString().split('T')[0];
                setEndDate(finalEndDate);
            }

            const params = new URLSearchParams();
            if (searchTitle) params.append('title', searchTitle);
            if (status) params.append('status', status);
            if (priority) params.append('priority', priority);
            params.append('startDate', finalStartDate);
            params.append('endDate', finalEndDate);
            params.append('hierarchyId', hierarchyId);

            const response = await apiRequest(`/task/all?${params.toString()}`, 'GET', null);
            setData(response || []);

        } catch (error) {
            console.error("Error al buscar tareas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        searchTask();
    }, []);

    // Lógica de Paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
    return (
        <div className="bg-card rounded-lg border border-border mx-5 shadow-lg p-6">
            <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <ClipboardCheck className="w-6 h-6 text-primary" />
                    </div>
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-foreground mb-2">Actividades Fijas</h2>
                    <p className="text-sm text-muted-foreground">
                        Gestiona y filtra las tareas importantes del equipo.
                    </p>
                </div>
            </div>

            <Card className="border-border mb-6">
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    {/* Input Título */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium">Título</label>
                        <input
                            type="text"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder='Buscar por título...'
                            value={searchTitle}
                            onChange={(e) => setSearchTitle(e.target.value)}
                        />
                    </div>

                    {/* Select Estado */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium">Estado</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="PENDING">Pendiente</option>
                            <option value="IN_PROGRESS">En Progreso</option>
                            <option value="DONE">Completada</option>
                        </select>
                    </div>

                    {/* Select Prioridad */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium">Prioridad</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option value="">Todas</option>
                            <option value="LOW">Baja</option>
                            <option value="MEDIUM">Media</option>
                            <option value="HIGH">Alta</option>
                        </select>
                    </div>

                    {/* Botón de búsqueda */}
                    <Button
                        onClick={searchTask}
                        className="w-full sm:w-auto h-11 px-8 cursor-pointer text-white" style={{ backgroundColor: colorCompany, borderColor: colorCompany }}
                        disabled={loading}
                    >
                        <Search className="w-4 h-4" />
                        Buscar
                    </Button>

                    <div className="space-y-2">
                        <label className="text-xs font-medium">Periodo Inicial</label>
                        <input
                            type="date"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium">Periodo Final</label>
                        <input
                            type="date"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>


                </CardContent>
            </Card>

            {/* Listado de Resultados */}
            <div className="grid grid-cols-1 gap-4 min-h-[400px]">
                {loading ? (
                    <div className="text-center py-10 text-muted-foreground italic">Actualizando lista...</div>
                ) : currentItems.length === 0 ? ( // Cambiado a currentItems
                    <div className="text-center py-10 bg-muted/20 rounded-lg border border-dashed border-border">
                        No se encontraron tareas con estos filtros.
                    </div>
                ) : (
                    // CLAVE: Aquí usamos currentItems para que solo renderice 3 cuadros
                    currentItems.map((task: any) => (
                        <div key={task.id} className="p-4 bg-background border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">{task.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${task.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                                    task.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                    }`}>
                                    {task.priority}
                                </span>
                            </div>

                            <div className="mt-4 flex gap-4 text-xs text-muted-foreground border-t pt-3">
                                <div className='flex gap-2 items-center'>
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span> Periodo de entrega : {task.startDate} - {task.endDate}</span>
                                </div>

                                <div className='flex gap-2 items-center'>
                                    <ChartBarIncreasing className="w-4 h-4 text-primary" />
                                    <span> Estado : {task.status} </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Controles de Paginación */}
            {data.length > itemsPerPage && ( // Cambiado de mockTasks a data
                <div className="flex items-center justify-between mt-6 px-2">
                    <p className="text-sm text-muted-foreground">
                        Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a <span className="font-medium">{Math.min(indexOfLastItem, data.length)}</span> de <span className="font-medium">{data.length}</span> resultados
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                <Button
                                    key={number}
                                    variant={currentPage === number ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => paginate(number)}
                                    className="h-8 w-8 p-0 text-xs"
                                    style={currentPage === number ? { backgroundColor: colorCompany, color: 'white' } : {}}
                                >
                                    {number}
                                </Button>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterTableTask;