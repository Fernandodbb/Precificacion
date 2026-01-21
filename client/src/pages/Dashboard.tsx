import React, { useEffect, useState } from 'react';
import api from '../api/api';
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
    const [stats, setStats] = useState({
        productsSold: 0,
        balanceMonth: 0,
        profitability: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/api/app/dashboard');
                setStats(data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Resumen General</h1>
                <p className="text-gray-500">Vista rápida de tu negocio (Mes Actual)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    title="Productos Vendidos"
                    value={loading ? '-' : stats.productsSold}
                    icon={Package}
                    color="bg-blue-500"
                />
                {/* Revenue/Balance Card */}
                <StatCard
                    title="Balance del Mes"
                    value={loading ? '-' : `€${stats.balanceMonth.toFixed(2)}`}
                    icon={Receipt}
                    color="bg-purple-500"
                />
                {/* Profitability Card - Orange */}
                <StatCard
                    title="Rentabilidad %"
                    value={loading ? '-' : `${stats.profitability}%`}
                    icon={TrendingUp}
                    color="bg-orange-500"
                />
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                <p className="text-gray-500">Selecciona una opción del menú para comenzar a gestionar tus datos.</p>
            </div>
        </div>
    );
};

export default Dashboard;
