import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { Plus, Edit, Trash2, AlertTriangle, Banknote } from 'lucide-react';

const Products = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [margin, setMargin] = useState('50');
    // Selection state: { materialId: quantity } 
    const [selectedMaterials, setSelectedMaterials] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            const [prodRes, matRes] = await Promise.all([
                api.get('/api/app/products'),
                api.get('/api/app/materials')
            ]);
            setProducts(prodRes.data);
            setMaterials(matRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Helper to calculate estimated cost in UI
    const calculateEstimatedCost = () => {
        return selectedMaterials.reduce((total, item) => {
            const mat = materials.find(m => m.id === item.id);
            return total + (mat ? mat.price * (parseFloat(item.quantity) || 0) : 0);
        }, 0);
    };

    const handleAddMaterial = () => {
        if (materials.length === 0) return;
        setSelectedMaterials([...selectedMaterials, { id: materials[0].id, quantity: 1 }]);
    };

    const handleMaterialChange = (index: number, field: string, value: any) => {
        const newMaterials = [...selectedMaterials];
        newMaterials[index] = { ...newMaterials[index], [field]: value };
        setSelectedMaterials(newMaterials);
    };

    const removeMaterialRow = (index: number) => {
        const newMaterials = [...selectedMaterials];
        newMaterials.splice(index, 1);
        setSelectedMaterials(newMaterials);
    };

    const handleEdit = (product: any) => {
        setName(product.name);
        setDescription(product.description || '');
        setMargin(product.margin.toString());

        // Reconstruct selectedMaterials from product.materials (ids) and product.quantities (values)
        const reconstructedMaterials = product.materials.map((matId: string, idx: number) => ({
            id: matId,
            quantity: product.quantities[idx]
        }));
        setSelectedMaterials(reconstructedMaterials);

        setEditingId(product.id);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;
        try {
            await api.delete(`/api/app/products/${id}`);
            fetchData();
        } catch (error) {
            alert('Error al eliminar producto');
        }
    };

    const handleAddToAccounting = async (product: any) => {
        // Quick add to accounting as Income
        if (!confirm(`¿Registrar venta de "${product.name}" por €${product.pvp?.toFixed(2)} en Contabilidad?`)) return;

        try {
            await api.post('/api/app/accounting', {
                type: 'ingreso',
                concept: `Venta: ${product.name}`,
                amount: product.pvp,
                date: new Date().toISOString().split('T')[0],
                materialCost: product.totalCost,
                category: 'Ventas'
            });
            alert('¡Venta registrada en contabilidad!');
        } catch (error) {
            alert('Error al registrar venta');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                name,
                description,
                margin: parseFloat(margin),
                selectedMaterials: selectedMaterials.map(m => ({ ...m, quantity: parseFloat(m.quantity) || 0 }))
            };

            if (editingId) {
                await api.put(`/api/app/products/${editingId}`, payload);
            } else {
                await api.post('/api/app/products', payload);
            }

            setShowModal(false);
            // Reset form
            setName(''); setDescription(''); setMargin('50'); setSelectedMaterials([]);
            setEditingId(null);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al guardar producto');
        }
    };

    if (loading) return <div>Cargando...</div>;

    if (materials.length === 0 && !showModal) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4 text-center">
                <div className="bg-yellow-100 p-4 rounded-full">
                    <AlertTriangle size={40} className="text-yellow-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">No tienes materias primas</h2>
                <p className="text-gray-500 max-w-md">
                    Para crear productos, primero necesitas registrar los ingredientes o materiales que utilizas.
                </p>
                <Link to="/materials" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    Ir a Materias Primas
                </Link>
            </div>
        );
    }

    const estimatedCost = calculateEstimatedCost();
    const estimatedPVP = estimatedCost * (1 + parseFloat(margin) / 100);

    return (
        <div className="space-y-6 lg:space-y-10 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-bold text-white serif tracking-tight">Mis Productos</h1>
                    <p className="text-gray-400 mt-1 sm:mt-2 font-medium text-sm sm:base">Gestiona tu catálogo y optimiza tus márgenes</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setName(''); setDescription(''); setMargin('50'); setSelectedMaterials([]);
                        setShowModal(true);
                    }}
                    className="btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center py-3 sm:py-2"
                >
                    <Plus size={20} />
                    <span>Nuevo Producto</span>
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {products.map(product => (
                    <div key={product.id} className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-4 sm:space-y-6 flex flex-col h-full hover:border-[#8a5cf5]/50 transition-all duration-500 group">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="font-bold text-lg sm:text-xl text-white serif group-hover:text-[#8a5cf5] transition-colors">{product.name}</h3>
                                <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 leading-relaxed">{product.description}</p>
                            </div>
                            <div className="bg-[#8a5cf5]/10 text-[#8a5cf5] font-bold px-4 py-1.5 rounded-full text-sm shrink-0 border border-[#8a5cf5]/20">
                                €{product.pvp?.toFixed(2)}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 text-sm space-y-3 flex-grow">
                            <div className="flex justify-between items-center text-gray-400">
                                <span className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                    <span>Coste Materiales</span>
                                </span>
                                <span className="font-semibold text-white">€{product.totalCost?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-400">
                                <span className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                    <span>Margen de Beneficio</span>
                                </span>
                                <span className="font-bold text-green-400">{product.margin}%</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                            <button
                                onClick={() => handleAddToAccounting(product)}
                                className="text-sm font-bold text-[#8a5cf5] hover:text-white flex items-center space-x-2 bg-[#8a5cf5]/5 px-4 py-2 rounded-xl transition-all"
                            >
                                <Banknote size={18} />
                                <span>Vender</span>
                            </button>

                            <div className="flex space-x-2">
                                <button onClick={() => handleEdit(product)} className="text-gray-500 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => handleDelete(product.id)} className="text-gray-500 hover:text-red-400 p-2 hover:bg-red-400/5 rounded-xl transition-all">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6">
                    <div className="bg-[#160c2a]/95 border border-white/10 rounded-3xl sm:rounded-[40px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-10 space-y-6 sm:space-y-8 custom-scrollbar">
                        <div className="space-y-2">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white serif tracking-tight">
                                {editingId ? 'Editar Producto' : 'Nuevo Producto'}
                            </h2>
                            <p className="text-gray-400 text-sm">Define los detalles y materiales para calcular tu precio ideal.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Nombre del Producto</label>
                                    <input required value={name} onChange={e => setName(e.target.value)} autoComplete="off"
                                        className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white focus:border-[#8a5cf5] transition-all outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Descripción</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white focus:border-[#8a5cf5] transition-all outline-none h-24 resize-none" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Materias Primas</label>
                                    <button type="button" onClick={handleAddMaterial}
                                        className="text-sm text-[#8a5cf5] font-bold hover:text-white transition-colors">+ Añadir Material</button>
                                </div>

                                <div className="space-y-3">
                                    {selectedMaterials.map((item, index) => {
                                        const mat = materials.find(m => m.id === item.id);
                                        return (
                                            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                                <div className="flex-1 w-full">
                                                    <select
                                                        value={item.id}
                                                        onChange={e => handleMaterialChange(index, 'id', e.target.value)}
                                                        className="w-full bg-transparent text-white border-none focus:ring-0 text-sm cursor-pointer"
                                                    >
                                                        {materials.map(m => (
                                                            <option key={m.id} value={m.id} className="bg-[#160c2a] text-white">{m.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-4">
                                                    <div className="text-sm font-bold text-gray-400 min-w-[70px]">
                                                        €{(Number(mat?.price) || 0).toFixed(2)}
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={item.quantity}
                                                            onChange={e => handleMaterialChange(index, 'quantity', e.target.value)}
                                                            className="w-16 sm:w-20 bg-black/20 border border-white/5 p-2 rounded-xl text-white text-center text-sm outline-none focus:border-[#8a5cf5]"
                                                            placeholder="Cant."
                                                        />
                                                        <span className="text-[10px] font-bold uppercase text-gray-500 w-8">{mat?.unit}</span>
                                                    </div>

                                                    <button type="button" onClick={() => removeMaterialRow(index)} className="text-gray-500 hover:text-red-400 transition-colors p-1">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 bg-[#8a5cf5]/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#8a5cf5]/10">
                                <div className="space-y-1 flex sm:block justify-between items-center sm:justify-start">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8a5cf5]">Margen (%)</label>
                                    <input
                                        type="number"
                                        value={margin}
                                        onChange={e => setMargin(e.target.value)}
                                        className="bg-transparent text-lg sm:text-xl font-bold text-white border-none focus:ring-0 p-0 w-20 sm:w-full text-right sm:text-left"
                                    />
                                </div>
                                <div className="space-y-1 flex sm:block justify-between items-center sm:justify-start">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">Coste Total</label>
                                    <div className="text-lg sm:text-xl font-bold text-white">€{estimatedCost.toFixed(2)}</div>
                                </div>
                                <div className="space-y-1 flex sm:block justify-between items-center sm:justify-start border-t border-[#8a5cf5]/10 pt-3 sm:pt-0 sm:border-0">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8a5cf5]">PVP Sugerido</label>
                                    <div className="text-2xl sm:text-3xl font-bold text-[#8a5cf5] serif">€{estimatedPVP.toFixed(2)}</div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="px-6 py-3 text-gray-400 hover:text-white font-bold transition-all">Cancelar</button>
                                <button type="submit" className="btn-primary min-w-[160px]">
                                    {editingId ? 'Actualizar' : 'Guardar Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
