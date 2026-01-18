import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
                axios.get('http://localhost:5000/api/app/products'),
                axios.get('http://localhost:5000/api/app/materials')
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
            await axios.delete(`http://localhost:5000/api/app/products/${id}`);
            fetchData();
        } catch (error) {
            alert('Error al eliminar producto');
        }
    };

    const handleAddToAccounting = async (product: any) => {
        // Quick add to accounting as Income
        if (!confirm(`¿Registrar venta de "${product.name}" por €${product.pvp?.toFixed(2)} en Contabilidad?`)) return;

        try {
            await axios.post('http://localhost:5000/api/app/accounting', {
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
                await axios.put(`http://localhost:5000/api/app/products/${editingId}`, payload);
            } else {
                await axios.post('http://localhost:5000/api/app/products', payload);
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
                <a href="/materials" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    Ir a Materias Primas
                </a>
            </div>
        );
    }

    const estimatedCost = calculateEstimatedCost();
    const estimatedPVP = estimatedCost * (1 + parseFloat(margin) / 100);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mis Productos</h1>
                    <p className="text-gray-500">Gestiona tu catálogo y precios</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setName(''); setDescription(''); setMargin('50'); setSelectedMaterials([]);
                        setShowModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <Plus size={20} />
                    <span>Nuevo Producto</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4 flex flex-col h-full">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                            </div>
                            <div className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full text-sm shrink-0 ml-2">
                                €{product.pvp?.toFixed(2)}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 text-sm space-y-2 flex-grow">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Coste MP:</span>
                                <span className="font-medium">€{product.totalCost?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Margen:</span>
                                <span className="font-medium text-green-600">{product.margin}%</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                            <button
                                onClick={() => handleAddToAccounting(product)}
                                className="text-sm font-medium text-green-600 hover:text-green-800 flex items-center space-x-1"
                                title="Registrar venta en contabilidad"
                            >
                                <Banknote size={16} />
                                <span>Vender</span>
                            </button>

                            <div className="flex space-x-2">
                                <button onClick={() => handleEdit(product)} className="text-gray-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => handleDelete(product.id)} className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
                        <h2 className="text-xl font-bold">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nombre del Producto</label>
                                    <input required value={name} onChange={e => setName(e.target.value)} autoComplete="off" className="w-full border p-2 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Descripción</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border p-2 rounded-lg h-20" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium">Materias Primas</label>
                                    <button type="button" onClick={handleAddMaterial} className="text-sm text-blue-600 font-medium hover:underline">+ Añadir Ingrediente</button>
                                </div>

                                {selectedMaterials.map((item, index) => {
                                    const mat = materials.find(m => m.id === item.id);
                                    return (
                                        <div key={index} className="flex items-center space-x-3 bg-gray-50 p-2 rounded-lg">
                                            <select
                                                value={item.id}
                                                onChange={e => handleMaterialChange(index, 'id', e.target.value)}
                                                className="flex-1 bg-white border p-1 rounded"
                                            >
                                                {materials.map(m => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
                                            </select>

                                            {/* Price Display */}
                                            <div className="w-24 text-right text-sm text-gray-600 bg-white border border-gray-200 px-2 py-1 rounded">
                                                €{(Number(mat?.price) || 0).toFixed(2)}
                                            </div>

                                            <input
                                                type="number"
                                                step="0.01"
                                                value={item.quantity}
                                                onChange={e => handleMaterialChange(index, 'quantity', e.target.value)}
                                                className="w-24 border p-1 rounded text-center"
                                                placeholder="Cant."
                                            />
                                            <span className="text-sm text-gray-500 w-8">{mat?.unit}</span>
                                            <button type="button" onClick={() => removeMaterialRow(index)} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    )
                                })}
                                {selectedMaterials.length === 0 && (
                                    <p className="text-sm text-gray-400 italic">No hay ingredientes seleccionados.</p>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-4 bg-blue-50 p-4 rounded-xl">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-blue-800 mb-1">Margen (%)</label>
                                    <input
                                        type="number"
                                        value={margin}
                                        onChange={e => setMargin(e.target.value)}
                                        className="w-full border p-1 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-blue-800 mb-1">Coste Total</label>
                                    <div className="text-lg font-bold text-gray-700">€{estimatedCost.toFixed(2)}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-blue-800 mb-1">PVP Sugerido</label>
                                    <div className="text-2xl font-bold text-blue-700">€{estimatedPVP.toFixed(2)}</div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingId ? 'Actualizar' : 'Guardar Producto'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
