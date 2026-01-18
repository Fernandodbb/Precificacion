import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, Boxes, Receipt, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className={`p-4 rounded-full ${color} bg-opacity-20`}>
            <Icon className={color.replace('bg-', 'text-')} size={24} />
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    // In a real app, we would fetch these stats from an endpoint like /api/app/stats
    // For now, we mimic empty or basic state
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Resumen General</h1>
                <p className="text-gray-500">Vista rápida de tu negocio</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Productos" value="-" icon={Package} color="bg-blue-500" />
                <StatCard title="Materias Primas" value="-" icon={Boxes} color="bg-green-500" />
                <StatCard title="Balance Mes" value="€0.00" icon={Receipt} color="bg-purple-500" />
                <StatCard title="Rentabilidad" value="0%" icon={TrendingUp} color="bg-orange-500" />
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                <p className="text-gray-500">Selecciona una opción del menú para comenzar a gestionar tus datos.</p>
            </div>
        </div>
    );
};

export default Dashboard;
