// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './layouts/AdminLayout';
import Company from './pages/Company';
import AdminPanel from './components/AdminPanel';
import GestorUsers from './components/GestorUsers';
import TaskManager from './components/TaskManager';


// Páginas de ejemplo

// Componentes de ejemplo
const Login = () => {
  const navigate = useNavigate();
  const handleLogin = (role: string) => {
    localStorage.setItem('token', 'fake-jwt');
    localStorage.setItem('role', role);
    localStorage.setItem('active', 'true');
    localStorage.setItem('nameUser', 'Juan Pérez');
    localStorage.setItem('nameCompany', 'Fundacion Calidad de Vida');
    localStorage.setItem('hierarchy', 'Gerente');
    localStorage.setItem('hierarchyId', '1');
    localStorage.setItem('colorCompany', '#3b82f6'); // Azul
    localStorage.setItem('idCompany', '1');
    localStorage.setItem('logoCompany', '/react.svg');
    localStorage.setItem('idUser', '1');  

    // Redirección inmediata según rol
    role === 'ADMIN' ? navigate('/company') : navigate('/mis-tareas');
  };
  return (
    <div className="p-20 text-center">
      <h1>SISTEMA EMPRESARIAL</h1>
      <button onClick={() => handleLogin('ADMIN')} className="bg-blue-500 p-2 m-2">Entrar como Admin</button>
      <button onClick={() => handleLogin('USER')} className="bg-green-500 p-2 m-2">Entrar como Usuario</button>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<h1>No tienes acceso a esta sección</h1>} />

        {/* RUTAS DE ADMINISTRADOR (Solo ADMIN) */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={
            <AdminLayout
            company={
              { 
                colorCompany: localStorage.getItem('colorCompany') || '#3b82f6',
                 logoCompany: localStorage.getItem('logoCompany') || 'https://www.vhv.rs/dpng/d/283-2832831_logos-de-empresas-de-computadoras-png-download-logo.png' }} />
              } >
            <Route path="/dashboard" element={<AdminPanel />} />
            <Route path="/usuarios" element={<GestorUsers />} />
            <Route path="/asignar-actividades" element={<TaskManager />} />
          </Route>
          <Route path="/company" element={<Company />} />
        </Route>

        {/* RUTAS DE USUARIO GENERAL (ADMIN y USER pueden entrar) */}
        <Route element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']} />}>
          <Route path="/mis-tareas" element={<Company />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}