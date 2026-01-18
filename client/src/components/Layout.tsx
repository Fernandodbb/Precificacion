import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, Boxes, Receipt, CreditCard, LogOut } from 'lucide-react';
import Chatbot from './Chatbot';

const SidebarItem = ({ to, icon: Icon, label, active }: any) => (
    <Link to={to} className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
        <Icon size={20} />
        <span className="font-medium">{label}</span>
    </Link>
);

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex h-screen bg-gray-100 text-gray-900 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
                        CostManager
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Hola, {user?.name}</p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/')} />
                    <SidebarItem to="/products" icon={Package} label="Mis Productos" active={isActive('/products')} />
                    <SidebarItem to="/materials" icon={Boxes} label="Materias Primas" active={isActive('/materials')} />
                    <SidebarItem to="/accounting" icon={Receipt} label="Contabilidad" active={isActive('/accounting')} />

                    <div className="pt-8 pb-2">
                        <p className="px-4 text-xs uppercase text-gray-500 font-semibold tracking-wider">Ajustes</p>
                    </div>
                    <SidebarItem to="/subscription" icon={CreditCard} label="Mi Suscripción" active={isActive('/subscription')} />
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={logout}
                        className="flex items-center space-x-3 px-4 py-3 w-full text-left text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 z-10">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {/* Simple dynamic title based on path could go here */}
                        Panel de Control
                    </h2>
                    <div className="flex items-center space-x-4">
                        {/* Top bar actions */}
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${user?.status === 'activo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {user?.status}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-8 bg-gray-50">
                    <Outlet />
                </div>

                {/* Chatbot Floating Button (Always visible) */}
                <Chatbot />

            </main>
        </div>
    );
};

export default Layout;
