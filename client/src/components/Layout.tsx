import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Boxes, Receipt, CreditCard, LogOut, Box } from 'lucide-react';
import Chatbot from './Chatbot';

const SidebarItem = ({ to, icon: Icon, label, active }: any) => (
    <Link to={to} className={`flex items-center space-x-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${active
        ? 'bg-gradient-to-r from-[#8a5cf5]/20 to-transparent text-white border-l-2 border-[#8a5cf5]'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}>
        <Icon size={20} className={`${active ? 'text-[#8a5cf5]' : 'text-gray-500 group-hover:text-gray-300'}`} />
        <span className="font-semibold text-sm tracking-wide">{label}</span>
    </Link>
);

const Layout = ({ children }: { children?: React.ReactNode }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const isActive = (path: string) => location.pathname === path;

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <div className="flex h-screen bg-[#0b0415] text-white font-sans overflow-hidden relative">
            {/* Fixora Glow Background */}
            <div className="fixora-bg"></div>

            {/* Sidebar Overlay for Mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 w-72 bg-black/40 backdrop-blur-2xl border-r border-white/5 flex flex-col z-40 transition-transform duration-300 transform
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:relative lg:translate-x-0 lg:flex
            `}>
                <div className="p-10 flex justify-between items-center">
                    <div>
                        <div className="flex items-center space-x-3 mb-1">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#8a5cf5] to-[#5d3fd3] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <Box size={22} className="text-white" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight serif">
                                Precificacion
                            </h1>
                        </div>
                        <p className="text-[11px] text-gray-500 uppercase tracking-widest pl-1 mt-1">
                            SaaS Solution
                        </p>
                    </div>
                </div>

                <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
                    {/* Only show main navigation if user is active */}
                    {user?.status !== 'vencido' && user?.status !== 'inactivo' && (
                        <div className="space-y-1 mb-8">
                            <p className="px-4 py-3 text-[10px] uppercase text-gray-500 font-bold tracking-[0.2em]">Principal</p>
                            <div onClick={() => setIsMobileMenuOpen(false)}>
                                <SidebarItem to="/products" icon={Package} label="Mis Productos" active={isActive('/products')} />
                            </div>
                            <div onClick={() => setIsMobileMenuOpen(false)}>
                                <SidebarItem to="/materials" icon={Boxes} label="Materias Primas" active={isActive('/materials')} />
                            </div>
                            <div onClick={() => setIsMobileMenuOpen(false)}>
                                <SidebarItem to="/accounting" icon={Receipt} label="Contabilidad" active={isActive('/accounting')} />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <p className="px-4 py-3 text-[10px] uppercase text-gray-500 font-bold tracking-[0.2em]">Facturación</p>
                        <div onClick={() => setIsMobileMenuOpen(false)}>
                            <SidebarItem to="/subscription" icon={CreditCard} label="Mi Suscripción" active={isActive('/subscription')} />
                        </div>
                    </div>
                </nav>

                <div className="p-8 border-t border-white/5">
                    <div className="flex items-center space-x-4 mb-6 px-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-sm font-bold text-purple-300">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold truncate max-w-[120px]">{user?.name}</span>
                            <span className="text-[10px] text-gray-500 truncate max-w-[120px]">{user?.email}</span>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center space-x-3 px-5 py-3.5 w-full text-gray-400 hover:text-red-400 hover:bg-red-500/5 rounded-2xl transition-all duration-300 group"
                    >
                        <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                        <span className="font-semibold text-sm">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                <header className="h-20 lg:h-24 flex items-center justify-between px-6 lg:px-12 z-10 border-b border-white/5 bg-black/5 backdrop-blur-md text-white">
                    <button
                        onClick={toggleMobileMenu}
                        className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>

                    <div className="flex items-center space-x-4 lg:space-x-8">
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] border backdrop-blur-md ${user?.status === 'activo' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            user?.status === 'prueba' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                            <span className="hidden sm:inline">
                                {user?.status === 'activo' ? 'Suscripción Activa' :
                                    user?.status === 'prueba' ? 'Periodo de Prueba' :
                                        user?.status?.toUpperCase() || 'DESCONOCIDO'}
                            </span>
                            <span className="sm:hidden">
                                {user?.status === 'activo' ? 'Activa' :
                                    user?.status === 'prueba' ? 'Prueba' :
                                        user?.status?.toUpperCase() || '!'}
                            </span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 sm:p-8 lg:p-12 custom-scrollbar">
                    {children || <Outlet />}
                </div>

                <Chatbot />
            </main>
        </div>
    );
};

export default Layout;
