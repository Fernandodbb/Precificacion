import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, ArrowUpCircle, ArrowDownCircle, Edit, Trash2 } from 'lucide-react';

const Accounting = () => {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form Data
    const [type, setType] = useState('gasto');
    const [concept, setConcept] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');

    const fetchRecords = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/app/accounting');
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
            await axios.delete(`http://localhost:5000/api/app/accounting/${id}`);
            fetchRecords();
        } catch (error) {
            alert('Error al borrar');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                date: new Date().toISOString().split('T')[0], // Keep simpler date
                concept,
                type,
                category,
                amount: parseFloat(amount)
            };

            if (editingId) {
                // Preserve original date if desired, or update. For now updating date is fine or simple override.
                // Let's attach editingId to url
                await axios.put(`http://localhost:5000/api/app/accounting/${editingId}`, payload);
            } else {
                await axios.post('http://localhost:5000/api/app/accounting', payload);
            }

            setShowModal(false);
            setConcept(''); setAmount(''); setCategory(''); setEditingId(null);
            fetchRecords();
        } catch (error) {
            alert('Error al guardar registro');
        }
    };

    if (loading) return <div>Cargando...</div>;

    const totalIncome = records.filter(r => r.type === 'ingreso').reduce((acc, curr) => acc + (curr.amount || 0), 0);

    // Total Expenses = Explicit Expenses + Material Costs (Cost of Goods Sold/COGS) attached to Incomes
    const totalExpenses = records.reduce((acc, curr) => {
        const expenseAmount = curr.type === 'gasto' ? (curr.amount || 0) : 0;
        const materialCost = curr.materialCost || 0;
        return acc + expenseAmount + materialCost;
    }, 0);

    const balance = totalIncome - totalExpenses;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Contabilidad</h1>
                    <p className="text-gray-500">Ingresos y gastos</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setConcept(''); setAmount(''); setCategory(''); setType('gasto');
                        setShowModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <Plus size={20} />
                    <span>Nuevo Movimiento</span>
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <p className="text-sm text-green-600 font-semibold uppercase">Total Ingresos</p>
                    <p className="text-2xl font-bold text-green-700">+€{totalIncome.toFixed(2)}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <p className="text-sm text-red-600 font-semibold uppercase">Total Gastos (incl. MP)</p>
                    <p className="text-2xl font-bold text-red-700">-€{totalExpenses.toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-500 font-semibold uppercase">Balance Neto</p>
                    <p className={`text-2xl font-bold ${balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        €{balance.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium text-sm">
                        <tr>
                            <th className="px-6 py-4">Fecha</th>
                            <th className="px-6 py-4">Concepto</th>
                            <th className="px-6 py-4">Categoría</th>
                            <th className="px-6 py-4 text-center">Coste MP</th>
                            <th className="px-6 py-4 text-right">Importe</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {records.map((record) => (
                            <tr key={record.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-500 text-sm">
                                    {record.date?.split('T')[0] || '-'}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 flex items-center space-x-2">
                                    {record.type === 'ingreso' ? <ArrowUpCircle size={16} className="text-green-500" /> : <ArrowDownCircle size={16} className="text-red-500" />}
                                    <span>{record.concept}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">{record.category || 'General'}</span>
                                </td>
                                <td className="px-6 py-4 text-center text-sm text-gray-400">
                                    {record.materialCost ? `-€${record.materialCost.toFixed(2)}` : '-'}
                                </td>
                                <td className={`px-6 py-4 text-right font-bold ${record.type === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                                    {record.type === 'ingreso' ? '+' : '-'}€{record.amount?.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        <button onClick={() => handleEdit(record)} className="text-gray-400 hover:text-blue-600 p-1">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(record.id)} className="text-gray-400 hover:text-red-600 p-1">
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <h2 className="text-xl font-bold">{editingId ? 'Editar Movimiento' : 'Registrar Movimiento'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button type="button" onClick={() => setType('ingreso')} className={`flex-1 py-1 text-sm font-medium rounded-md transition-colors ${type === 'ingreso' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}>Ingreso</button>
                                <button type="button" onClick={() => setType('gasto')} className={`flex-1 py-1 text-sm font-medium rounded-md transition-colors ${type === 'gasto' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}>Gasto</button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Concepto</label>
                                <input required value={concept} onChange={e => setConcept(e.target.value)} className="w-full border p-2 rounded-lg" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Importe (€)</label>
                                <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} className="w-full border p-2 rounded-lg" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Categoría</label>
                                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border p-2 rounded-lg">
                                    <option value="">Seleccionar...</option>
                                    <option value="Ventas">Ventas</option>
                                    <option value="Compra Material">Compra Material</option>
                                    <option value="Servicios">Servicios</option>
                                    <option value="Impuestos">Impuestos</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingId ? 'Actualizar' : 'Guardar'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Accounting;
