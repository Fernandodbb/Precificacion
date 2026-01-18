import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
            const { data } = await axios.get('http://localhost:5000/api/app/materials');
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
            await axios.delete(`http://localhost:5000/api/app/materials/${id}`);
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
                await axios.put(`http://localhost:5000/api/app/materials/${editingId}`, payload);
            } else {
                await axios.post('http://localhost:5000/api/app/materials', payload);
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Materias Primas</h1>
                    <p className="text-gray-500">Gestiona el stock y precios de tus insumos</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ name: '', unit: 'units', price: '', provider: '', stock: '0', minStock: '5' });
                        setShowModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <Plus size={20} />
                    <span>Nueva Materia Prima</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium text-sm">
                        <tr>
                            <th className="px-6 py-4">Nombre</th>
                            <th className="px-6 py-4">Precio / Unidad</th>
                            <th className="px-6 py-4">Proveedor</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {materials.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No hay materias primas registradas.
                                </td>
                            </tr>
                        ) : (
                            materials.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                                    <td className="px-6 py-4">€{Number(item.price).toFixed(2)} / {item.unit}</td>
                                    <td className="px-6 py-4 text-gray-500">{item.provider || '-'}</td>
                                    <td className="px-6 py-4 flex justify-end space-x-2">
                                        <button onClick={() => handleEdit(item)} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors">
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
            {
                showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Editar Materia Prima' : 'Nueva Materia Prima'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Nombre</label>
                                        <input name="name" autoComplete="off" required value={formData.name} onChange={handleChange} className="w-full border p-2 rounded-lg" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Unidad</label>
                                        <select name="unit" value={formData.unit} onChange={handleChange} className="w-full border p-2 rounded-lg">
                                            <option value="units">Unidades</option>
                                            <option value="kg">Kilogramos</option>
                                            <option value="g">Gramos</option>
                                            <option value="L">Litros</option>
                                            <option value="ml">Mililitros</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Precio por Unidad (€)</label>
                                        <input type="number" step="0.01" name="price" required value={formData.price} onChange={handleChange} className="w-full border p-2 rounded-lg" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Proveedor</label>
                                        <input name="provider" value={formData.provider} onChange={handleChange} className="w-full border p-2 rounded-lg" />
                                    </div>
                                </div>
                                {/* Stock fields removed as requested */}

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingId ? 'Actualizar' : 'Guardar'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Materials;
