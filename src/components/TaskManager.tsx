import React from 'react'

const TaskManager = () => {
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
    </form>
  </div>
  )
}

export default TaskManager