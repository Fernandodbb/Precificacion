import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Materials = () => {
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        unit: 'units',
        price: '',
        provider: '',
        stock: '0',
        minStock: '5'
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchMaterials = async () => {
        try {
            const { data } = await api.get('/api/app/materials');
            setMaterials(data);
        } catch (error) {
            console.error('Error fetching materials', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (item: any) => {
        setFormData({
            name: item.name,
            unit: item.unit,
            price: item.price,
            provider: item.provider,
            stock: '0',
            minStock: '0'
        });
        setEditingId(item.id);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta materia prima?')) return;
        try {
            await api.delete(`/api/app/materials/${id}`);
            fetchMaterials();
        } catch (error) {
            console.error('Error deleting material', error);
            alert('Error al eliminar');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                stock: 0,
                minStock: 0
            };

            if (editingId) {
                await api.put(`/api/app/materials/${editingId}`, payload);
            } else {
                await api.post('/api/app/materials', payload);
            }

            setShowModal(false);
            setFormData({ name: '', unit: 'units', price: '', provider: '', stock: '0', minStock: '5' });
            setEditingId(null);
            fetchMaterials();
        } catch (error) {
            console.error('Error saving material', error);
            alert('Error al guardar materia prima');
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold text-white serif tracking-tight">Materias Primas</h1>
                    <p className="text-gray-400 mt-2 font-medium">Gestiona el stock y precios de tus materiales</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ name: '', unit: 'units', price: '', provider: '', stock: '0', minStock: '5' });
                        setShowModal(true);
                    }}
                    className="btn-primary flex items-center space-x-2"
                >
                    <Plus size={20} />
                    <span>Nueva Materia Prima</span>
                </button>
            </div>

            <div className="glass-card rounded-[32px] overflow-hidden border border-white/5 shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-white/[0.02] text-gray-500 font-bold text-[10px] uppercase tracking-widest border-b border-white/5">
                        <tr>
                            <th className="px-8 py-6">Nombre</th>
                            <th className="px-8 py-6">Precio / Unidad</th>
                            <th className="px-8 py-6">Proveedor</th>
                            <th className="px-8 py-6 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {materials.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-8 py-12 text-center text-gray-500 italic">
                                    No hay materias primas registradas.
                                </td>
                            </tr>
                        ) : (
                            materials.map((item) => (
                                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6 font-bold text-white group-hover:text-[#8a5cf5] transition-colors">{item.name}</td>
                                    <td className="px-8 py-6 text-gray-300">
                                        <span className="font-bold text-white">€{Number(item.price).toFixed(2)}</span> / {item.unit}
                                    </td>
                                    <td className="px-8 py-6 text-gray-500">{item.provider || '-'}</td>
                                    <td className="px-8 py-6 flex justify-end space-x-3">
                                        <button onClick={() => handleEdit(item)} className="p-2.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
                    <div className="bg-[#160c2a]/95 border border-white/10 rounded-[40px] shadow-2xl max-w-lg w-full p-10 space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold text-white serif tracking-tight">
                                {editingId ? 'Editar Material' : 'Nuevo Material'}
                            </h2>
                            <p className="text-gray-400 text-sm">Registra o actualiza la información básica de tu materia prima.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Nombre</label>
                                    <input name="name" autoComplete="off" required value={formData.name} onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white focus:border-[#8a5cf5] transition-all outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Unidad</label>
                                    <select name="unit" value={formData.unit} onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white focus:border-[#8a5cf5] transition-all outline-none cursor-pointer">
                                        <option value="units" className="bg-[#160c2a]">Unidades</option>
                                        <option value="kg" className="bg-[#160c2a]">Kilogramos</option>
                                        <option value="g" className="bg-[#160c2a]">Gramos</option>
                                        <option value="L" className="bg-[#160c2a]">Litros</option>
                                        <option value="ml" className="bg-[#160c2a]">Mililitros</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Precio / Unidad (€)</label>
                                    <input type="number" step="0.01" name="price" required value={formData.price} onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white focus:border-[#8a5cf5] transition-all outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Proveedor</label>
                                    <input name="provider" value={formData.provider} onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white focus:border-[#8a5cf5] transition-all outline-none" />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="px-6 py-3 text-gray-400 hover:text-white font-bold transition-all">Cancelar</button>
                                <button type="submit" className="btn-primary flex-1">{editingId ? 'Actualizar' : 'Guardar Material'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Materials;
