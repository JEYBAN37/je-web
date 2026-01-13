// src/layouts/AdminLayout.tsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const logout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-indigo-900 text-white p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
        <nav className="space-y-4">
          <NavLink to="/dashboard" className={({isActive}) => isActive ? "block text-yellow-400" : "block"}>Inicio</NavLink>
          <NavLink to="/usuarios" className={({isActive}) => isActive ? "block text-yellow-400" : "block"}>Gestión Usuarios</NavLink>
          <NavLink to="/empresas" className={({isActive}) => isActive ? "block text-yellow-400" : "block"}>Empresas</NavLink>
        </nav>
        <button onClick={logout} className="mt-10 text-red-300">Cerrar Sesión</button>
      </aside>
      <main className="flex-1 bg-gray-50 p-10 overflow-auto">
        <Outlet /> 
      </main>
    </div>
  );
};