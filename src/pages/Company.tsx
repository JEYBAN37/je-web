import React from 'react'
import CompanyCreate from '../components/CompanyCreate';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';

type Props = {}

const Company = (props: Props) => {   
    const navigate = useNavigate(); // Inicializas el hook
    const active = localStorage.getItem('active');
    const colorPage = localStorage.getItem('colorPage') || '#3b82f6'; // Azul por defecto
    const nameCompany = localStorage.getItem('nameCompany') || 'Mi Empresa';

    const handleLoadCompany = () => {
        // Lógica para cargar la empresa
        alert("Cargando empresa...");
        // redirijir a otra página si es necesario
        navigate('/admin')

    }

    return (
        <div>
            {active === 'false' ? (
                <CompanyCreate />
            ) : (
                <div
                    className="min-h-screen p-4 md:p-8 transition-all duration-700 flex items-center justify-center"
                    style={{
                        backgroundImage: `linear-gradient(135deg, ${colorPage}15 0%, ${colorPage}05 50%, #ffffff 100%)`,
                        backgroundAttachment: "fixed",
                    }}
                >
                    <div className="w-full max-w-4xl">
                        <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-teal-600 shadow-lg mb-4">
                                <Building2 className="w-10 h-10 text-white" />
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent leading-tight">
                                    Bienvenido a {nameCompany}
                                </h1>
                                <p className="text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
                                    Para comenzar a utilizar el sistema, por favor inicia sesión de tu empresa.
                                </p>
                            </div>
                            <Button
                                size="lg"
                                className="mt-6 bg-gradient-to-r from-blue-500 to-teal-600 hover:from-blue-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                onClick={() => handleLoadCompany()}
                            >
                                <Building2 className="mr-2 h-5 w-5" />
                                Iniciar Sesión de Empresa
                            </Button>
                        </div>
                    </div></div>
            )}
        </div>
    )
}

export default Company
