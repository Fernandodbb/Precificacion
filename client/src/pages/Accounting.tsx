import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Plus, ArrowUpCircle, ArrowDownCircle, Edit, Trash2 } from 'lucide-react';

const Accounting = () => {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Filters
    const [dateFilter, setDateFilter] = useState<'month' | 'year' | 'custom'>('month');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // Form Data
    const [type, setType] = useState('gasto');
    const [concept, setConcept] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');

    const fetchRecords = async () => {
        try {
            const { data } = await api.get('/api/app/accounting');
            setRecords(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    // Filter Logic
    const filteredRecords = records.filter(record => {
        if (!record.date) return false;
        const recordDate = new Date(record.date);
        const now = new Date();

        if (dateFilter === 'month') {
            return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
        } else if (dateFilter === 'year') {
            return recordDate.getFullYear() === now.getFullYear();
        } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
            const start = new Date(customStartDate);
            const end = new Date(customEndDate);
            // Include end date fully
            end.setHours(23, 59, 59, 999);
            return recordDate >= start && recordDate <= end;
        }
        return true;
    });

    // Calculations based on filtered records
    const totalIncome = filteredRecords.filter(r => r.type === 'ingreso').reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const totalExpenses = filteredRecords.reduce((acc, curr) => {
        const expenseAmount = curr.type === 'gasto' ? (curr.amount || 0) : 0;
        const materialCost = curr.materialCost || 0;
        return acc + expenseAmount + materialCost;
    }, 0);

    const balance = totalIncome - totalExpenses;


    const handleEdit = (record: any) => {
        setType(record.type);
        setConcept(record.concept);
        setAmount(record.amount);
        setCategory(record.category || '');
        setEditingId(record.id);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que quieres borrar este movimiento?')) return;
        try {
            await api.delete(`/api/app/accounting/${id}`);
            fetchRecords();
        } catch (error) {
            alert('Error al borrar');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                date: new Date().toISOString().split('T')[0],
                concept,
                type,
                category,
                amount: parseFloat(amount)
            };

            if (editingId) {
                await api.put(`/api/app/accounting/${editingId}`, payload);
            } else {
                await api.post('/api/app/accounting', payload);
            }

            setShowModal(false);
            setConcept(''); setAmount(''); setCategory(''); setEditingId(null);
            fetchRecords();
        } catch (error) {
            alert('Error al guardar registro');
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="space-y-6 lg:space-y-10 animate-fade-in">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-bold text-white serif tracking-tight">Contabilidad</h1>
                    <p className="text-gray-400 mt-1 sm:mt-2 font-medium text-xs sm:text-sm">Controla tus beneficios y flujo de caja en tiempo real</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
                    {/* Filter Controls */}
                    <div className="bg-white/5 p-1 rounded-xl sm:rounded-2xl border border-white/10 flex items-center backdrop-blur-md">
                        <button
                            onClick={() => setDateFilter('month')}
                            className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest rounded-lg sm:rounded-xl transition-all ${dateFilter === 'month' ? 'bg-[#8a5cf5] text-white shadow-lg shadow-purple-500/30' : 'text-gray-500 hover:text-white'}`}
                        >
                            Mes
                        </button>
                        <button
                            onClick={() => setDateFilter('year')}
                            className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest rounded-lg sm:rounded-xl transition-all ${dateFilter === 'year' ? 'bg-[#8a5cf5] text-white shadow-lg shadow-purple-500/30' : 'text-gray-500 hover:text-white'}`}
                        >
                            Año
                        </button>
                        <button
                            onClick={() => setDateFilter('custom')}
                            className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest rounded-lg sm:rounded-xl transition-all ${dateFilter === 'custom' ? 'bg-[#8a5cf5] text-white shadow-lg shadow-purple-500/30' : 'text-gray-500 hover:text-white'}`}
                        >
                            Rango
                        </button>
                    </div>

                    {dateFilter === 'custom' && (
                        <div className="flex items-center justify-between sm:justify-start gap-2 bg-white/5 px-3 py-2 rounded-xl sm:rounded-2xl border border-white/10 backdrop-blur-md">
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="bg-transparent text-xs text-white border-none focus:ring-0 p-0 w-24 sm:w-auto"
                            />
                            <span className="text-gray-600 font-bold">-</span>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="bg-transparent text-xs text-white border-none focus:ring-0 p-0 w-24 sm:w-auto"
                            />
                        </div>
                    )}

                    <button
                        onClick={() => {
                            setEditingId(null);
                            setConcept(''); setAmount(''); setCategory(''); setType('gasto');
                            setShowModal(true);
                        }}
                        className="btn-primary flex items-center space-x-2 justify-center py-3 sm:py-2"
                    >
                        <Plus size={20} />
                        <span>Nuevo Registro</span>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-l-4 border-l-green-400">
                    <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Ingresos</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-400">+€{totalIncome.toFixed(2)}</p>
                </div>
                <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-l-4 border-l-red-400">
                    <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Gastos</p>
                    <p className="text-xl sm:text-2xl font-bold text-red-400">-€{totalExpenses.toFixed(2)}</p>
                </div>
                <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-l-4 border-l-purple-400">
                    <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Balance Neto</p>
                    <p className={`text-xl sm:text-2xl font-bold ${balance >= 0 ? 'text-white' : 'text-red-400'}`}>
                        €{balance.toFixed(2)}
                    </p>
                </div>
                <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-l-4 border-l-blue-400">
                    <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Rentabilidad</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-400">
                        {totalExpenses > 0 ? ((balance / totalExpenses) * 100).toFixed(2) : '0.00'}%
                    </p>
                </div>
            </div>

            {/* List */}
            <div className="glass-card rounded-2xl sm:rounded-[32px] overflow-hidden border border-white/5 shadow-2xl overflow-x-auto custom-scrollbar">
                <table className="w-full text-left min-w-[800px] sm:min-w-0">
                    <thead className="bg-white/[0.02] text-gray-500 font-bold text-[10px] uppercase tracking-widest border-b border-white/5">
                        <tr>
                            <th className="px-6 sm:px-8 py-4 sm:py-6">Fecha</th>
                            <th className="px-6 sm:px-8 py-4 sm:py-6">Concepto</th>
                            <th className="px-6 sm:px-8 py-4 sm:py-6">Categoría</th>
                            <th className="px-6 sm:px-8 py-4 sm:py-6 text-center text-gray-600">Coste MP</th>
                            <th className="px-6 sm:px-8 py-4 sm:py-6 text-right">Importe</th>
                            <th className="px-6 sm:px-8 py-4 sm:py-6 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {filteredRecords.map((record) => (
                            <tr key={record.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 sm:px-8 py-4 sm:py-6 text-gray-500 text-xs sm:text-sm font-medium">
                                    {record.date?.split('T')[0] || '-'}
                                </td>
                                <td className="px-6 sm:px-8 py-4 sm:py-6 font-bold text-white flex items-center space-x-2 sm:space-x-3 group-hover:text-[#8a5cf5] transition-colors">
                                    <div className={`p-1 sm:p-1.5 rounded-lg ${record.type === 'ingreso' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {record.type === 'ingreso' ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                                    </div>
                                    <span className="text-sm sm:text-base">{record.concept}</span>
                                </td>
                                <td className="px-6 sm:px-8 py-4 sm:py-6">
                                    <span className="bg-white/5 text-gray-400 px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">{record.category || 'General'}</span>
                                </td>
                                <td className="px-6 sm:px-8 py-4 sm:py-6 text-center text-xs sm:text-sm text-gray-600 font-medium">
                                    {record.materialCost ? `-€${record.materialCost.toFixed(2)}` : '-'}
                                </td>
                                <td className={`px-6 sm:px-8 py-4 sm:py-6 text-right font-bold text-base sm:text-lg ${record.type === 'ingreso' ? 'text-green-400' : 'text-red-400'}`}>
                                    {record.type === 'ingreso' ? '+' : '-'}€{record.amount?.toFixed(2)}
                                </td>
                                <td className="px-6 sm:px-8 py-4 sm:py-6">
                                    <div className="flex justify-end space-x-1 sm:space-x-2">
                                        <button onClick={() => handleEdit(record)} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(record.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6">
                    <div className="bg-[#160c2a]/95 border border-white/10 rounded-3xl sm:rounded-[40px] shadow-2xl max-w-md w-full p-6 sm:p-10 space-y-6 sm:space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white serif tracking-tight">
                                {editingId ? 'Editar Movimiento' : 'Nuevo Registro'}
                            </h2>
                            <p className="text-gray-400 text-sm">Gestiona tus entradas y salidas de dinero fácilmente.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
                                <button type="button" onClick={() => setType('ingreso')}
                                    className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all ${type === 'ingreso' ? 'bg-green-500/20 text-green-400' : 'text-gray-500'}`}>Ingreso</button>
                                <button type="button" onClick={() => setType('gasto')}
                                    className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all ${type === 'gasto' ? 'bg-red-500/20 text-red-400' : 'text-gray-500'}`}>Gasto</button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Concepto</label>
                                <input required value={concept} onChange={e => setConcept(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white focus:border-[#8a5cf5] transition-all outline-none" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Importe (€)</label>
                                <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white focus:border-[#8a5cf5] transition-all outline-none" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Categoría</label>
                                <select value={category} onChange={e => setCategory(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white focus:border-[#8a5cf5] transition-all outline-none cursor-pointer">
                                    <option value="" className="bg-[#160c2a]">Seleccionar...</option>
                                    <option value="Ventas" className="bg-[#160c2a]">Ventas</option>
                                    <option value="Compra Material" className="bg-[#160c2a]">Compra Material</option>
                                    <option value="Servicios" className="bg-[#160c2a]">Servicios</option>
                                    <option value="Impuestos" className="bg-[#160c2a]">Impuestos</option>
                                    <option value="Otro" className="bg-[#160c2a]">Otro</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="px-6 py-3 text-gray-400 hover:text-white font-bold transition-all">Cancelar</button>
                                <button type="submit" className="btn-primary flex-1">{editingId ? 'Actualizar' : 'Registrar'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Accounting;
