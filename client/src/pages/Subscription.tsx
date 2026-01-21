import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, ShieldAlert } from 'lucide-react';
import api from '../api/api';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const Subscription = () => {
    const { user } = useAuth();
    const [billingCycle, setBillingCycle] = useState<'mensual' | 'anual'>('mensual');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [monthlyPrice, setMonthlyPrice] = useState(0);
    const [yearlyDiscount, setYearlyDiscount] = useState(0);

    const isExpired = user?.status === 'vencido' || user?.status === 'inactivo';

    const calculateDaysRemaining = () => {
        if (!user?.endDate || isExpired) return 0;
        const end = new Date(user.endDate);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const daysRemaining = calculateDaysRemaining();

    const calculateYearlyPrice = () => {
        const total = monthlyPrice * 12;
        return (total * (1 - yearlyDiscount / 100)).toFixed(2);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 py-12 px-6 animate-fade-in">
            <div className="text-center space-y-3">
                <h1 className="text-4xl font-bold text-white serif tracking-tight">Mi Suscripción</h1>
                <p className="text-gray-400 font-medium max-w-md mx-auto">Gestiona tu plan y accede a todas las herramientas de optimización</p>
            </div>

            {message && (
                <div className={`p-5 rounded-3xl border backdrop-blur-md animate-scale-in text-center font-bold ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-10 items-stretch">
                {/* Current Status Card */}
                <div className="glass-card rounded-[40px] overflow-hidden flex flex-col border border-white/5 relative group">
                    <div className={`p-10 text-white relative overflow-hidden ${isExpired ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20' : 'bg-gradient-to-br from-[#8a5cf5]/20 to-[#5d3fd3]/20'}`}>
                        {/* Decorative background glow */}
                        <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-20 ${isExpired ? 'bg-red-500' : 'bg-purple-500'}`}></div>

                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Estado Actual</p>
                                <h2 className="text-3xl font-bold serif">
                                    {isExpired ? 'Plan Vencido' : (user?.tipo_suscripcion ? (user.tipo_suscripcion.charAt(0).toUpperCase() + user.tipo_suscripcion.slice(1)) : 'Pro')}
                                    {!isExpired && user?.status === 'prueba' ? ' (Prueba)' : ''}
                                </h2>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md ${isExpired ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                                {isExpired ? 'EXPIRADO' : (user?.status === 'activo' ? 'ACTIVA' : user?.status)}
                            </div>
                        </div>
                    </div>

                    <div className="p-10 space-y-8 flex-1 flex flex-col justify-center relative z-10">
                        <div className="flex items-center space-x-6">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${daysRemaining > 0 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {isExpired ? <ShieldAlert size={32} /> : <Calendar size={32} />}
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-white text-lg">
                                    {isExpired ? 'Suscripción Finalizada' : (user?.status === 'prueba' ? 'Periodo de Prueba' : 'Suscripción Activa')}
                                </p>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {daysRemaining > 0
                                        ? `Le quedan ${daysRemaining} días de acceso premium.`
                                        : 'Tu periodo ha finalizado. Renueva para continuar escalando tu negocio.'}
                                </p>
                            </div>
                        </div>

                        {!isExpired && user?.precio_suscripcion && user?.precio_suscripcion !== '0' && (
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Última renovación</p>
                                <p className="text-white font-bold">
                                    {user.precio_suscripcion}€ <span className="text-gray-500 font-medium">/ {user.tipo_suscripcion === 'anual' ? 'año' : 'mes'}</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Renewal / Upgrade Card */}
                <div className="glass-card rounded-[40px] overflow-hidden flex flex-col border border-[#8a5cf5]/20 shadow-2xl shadow-purple-500/5 items-center">
                    <div className="p-10 flex-1 w-full space-y-8">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-white serif tracking-tight">Potencia tu Negocio</h3>
                            <p className="text-gray-400 text-sm">Elige el plan que mejor se adapte a tu ritmo de crecimiento.</p>
                        </div>

                        {/* Billing Cycle Toggle */}
                        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
                            <button
                                className={`flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${billingCycle === 'mensual' ? 'bg-[#8a5cf5] text-white shadow-lg shadow-purple-500/30' : 'text-gray-500 hover:text-white'}`}
                                onClick={() => setBillingCycle('mensual')}
                            >
                                Mensual
                            </button>
                            <button
                                className={`flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${billingCycle === 'anual' ? 'bg-[#8a5cf5] text-white shadow-lg shadow-purple-500/30' : 'text-gray-500 hover:text-white'}`}
                                onClick={() => setBillingCycle('anual')}
                            >
                                Anual (-{yearlyDiscount}%)
                            </button>
                        </div>

                        <div className="text-center py-4">
                            <div className="flex items-center justify-center space-x-2">
                                <span className="text-5xl font-bold text-white serif px-2">
                                    {billingCycle === 'mensual' ? `${monthlyPrice}€` : `${calculateYearlyPrice()}€`}
                                </span>
                                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">/ {billingCycle === 'mensual' ? 'mes' : 'año'}</span>
                            </div>
                        </div>

                        {/* Payment Options */}
                        <div className="pt-4 border-t border-white/5">
                            <PayPalPaymentSection
                                billingCycle={billingCycle}
                                onSuccess={() => setMessage({ type: 'success', text: 'Pago realizado con éxito. Suscripción renovada.' })}
                                onError={(err) => setMessage({ type: 'error', text: err })}
                                onConfigLoaded={(p, d) => {
                                    setMonthlyPrice(p);
                                    setYearlyDiscount(d);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PayPalPaymentSection = ({ billingCycle, onSuccess, onError, onConfigLoaded }: { billingCycle: string, onSuccess: () => void, onError: (msg: string) => void, onConfigLoaded: (price: number, discount: number) => void }) => {
    const [clientId, setClientId] = useState<string | null>(null);
    const { updateUser } = useAuth();

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const { data } = await api.get('/api/payment/config');
                setClientId(data.clientId);
                if (data.price && data.discount) {
                    onConfigLoaded(Number(data.price), Number(data.discount));
                }
            } catch (error) {
                console.error('Error fetching PayPal Config', error);
            }
        };
        fetchConfig();
    }, []);

    if (!clientId) return <div className="p-4 text-center text-gray-500">Cargando opciones de pago...</div>;

    return (
        <PayPalScriptProvider options={{ clientId: clientId, currency: "EUR" }}>
            <div className="space-y-4">
                <PayPalButtons
                    style={{ layout: "vertical" }}
                    createOrder={async (_data, _actions) => {
                        try {
                            const response = await api.post('/api/payment/create-order', {
                                plan: billingCycle
                            });
                            return response.data.id;
                        } catch (err) {
                            console.error(err);
                            onError('Error al iniciar el pago');
                            throw err;
                        }
                    }}
                    onApprove={async (data, _actions) => {
                        try {
                            const response = await api.post('/api/payment/capture-order', {
                                orderID: data.orderID,
                                plan: billingCycle
                            });

                            if (response.data.user && updateUser) {
                                updateUser(response.data.user);
                            }

                            onSuccess();
                        } catch (err) {
                            console.error(err);
                            onError('Error al procesar el pago');
                        }
                    }}
                />
            </div>
        </PayPalScriptProvider>
    );
};

export default Subscription;
