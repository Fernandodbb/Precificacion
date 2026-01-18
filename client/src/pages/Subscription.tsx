import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CreditCard, CheckCircle } from 'lucide-react';

const Subscription = () => {
    const { user } = useAuth();

    return (
        <div className="max-w-2xl mx-auto space-y-8 py-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Mi Suscripción</h1>
                <p className="text-gray-500">Gestiona tu plan y facturación</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 font-medium mb-1">Plan Actual</p>
                            <h2 className="text-3xl font-bold">Pro Trial</h2>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wide">
                            {user?.status}
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-3 rounded-full">
                            <CheckCircle className="text-green-600" size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">Suscripción Activa</p>
                            <p className="text-sm text-gray-500">Tu periodo de prueba finaliza en 14 días.</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center space-x-2">
                            <CreditCard size={20} />
                            <span>Gestionar Pagos (Stripe)</span>
                        </button>
                        <p className="text-xs text-center text-gray-400 mt-4">
                            La gestión de pagos se realiza de forma segura a través de nuestro proveedor.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Subscription;
