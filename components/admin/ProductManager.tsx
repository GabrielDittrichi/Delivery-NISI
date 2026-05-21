'use client'
import { Category, Product } from '@/lib/db';
import { addProduct, deleteProduct, updateProduct } from '@/lib/actions';
import { useState } from 'react';
import { Trash2, Plus, Edit2, X } from 'lucide-react';
import ImageUpload from './ImageUpload';
import Image from 'next/image';

export default function ProductManager({ categories, products }: { categories: Category[], products: Product[] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const initialFormState = {
    categoryId: categories[0]?.id || '',
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    proteins: 0,
    calories: 0,
    weight: 0,
    volume: 0,
    hasFlavors: false,
    flavors: [] as string[],
    hasAddons: false,
    allowMultipleAddons: true,
    addons: [] as { name: string, price: number }[],
    isActive: true,
    isFeatured: false,
    sortOrder: 0
  };

  const [formData, setFormData] = useState(initialFormState);
  const [newFlavor, setNewFlavor] = useState('');
  const [newAddon, setNewAddon] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState('');

  const resetForm = () => {
    setFormData({
        ...initialFormState,
        categoryId: categories[0]?.id || ''
    });
    setIsEditing(false);
    setEditingId(null);
  }

  const handleEdit = (product: Product) => {
    setFormData({
        categoryId: product.categoryId,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl || '',
        proteins: product.proteins || 0,
        calories: product.calories || 0,
        weight: product.weight || 0,
        volume: product.volume || 0,
        hasFlavors: !!(product.flavors && product.flavors.length > 0),
        flavors: product.flavors ? product.flavors.map(f => f.name) : [],
        hasAddons: !!(product.addons && product.addons.length > 0),
        allowMultipleAddons: product.allowMultipleAddons ?? true,
        addons: product.addons ? product.addons.map(a => ({ name: a.name, price: a.price || 0 })) : [],
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
        sortOrder: product.sortOrder || 0
    });
    setEditingId(product.id);
    setIsEditing(true);
  }

  const handleAddFlavor = () => {
    if (newFlavor.trim()) {
      setFormData(prev => ({
        ...prev,
        flavors: [...prev.flavors, newFlavor.trim()]
      }));
      setNewFlavor('');
    }
  };

  const handleRemoveFlavor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      flavors: prev.flavors.filter((_, i) => i !== index)
    }));
  };

  const handleAddAddon = () => {
    if (newAddon.trim()) {
      const price = parseFloat(newAddonPrice.replace(',', '.')) || 0;
      setFormData(prev => ({
        ...prev,
        addons: [...prev.addons, { name: newAddon.trim(), price }]
      }));
      setNewAddon('');
      setNewAddonPrice('');
    }
  };

  const handleRemoveAddon = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addons: prev.addons.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        if (editingId) {
            await updateProduct({ ...formData, id: editingId });
        } else {
            await addProduct(formData);
        }
        resetForm();
    } catch (error) {
        console.error('Error saving product:', error);
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza?')) {
        await deleteProduct(id);
    }
  }

  const handleImageUploaded = (url: string) => {
      setFormData(prev => ({ ...prev, imageUrl: url }));
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800">Gerenciar Produtos</h2>
        {!isEditing && (
            <button 
                onClick={() => setIsEditing(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
            >
                <Plus size={18} /> Novo Produto
            </button>
        )}
      </div>

      {isEditing && (
        <div className="mb-8 p-4 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            
            <div className="mb-4">
                <ImageUpload onUploadComplete={handleImageUploaded} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Categoria</label>
                    <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
                        required
                    >
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Descrição</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
                        rows={2}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Preço (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Peso (g)</label>
                        <input
                            type="number"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Volume (ml)</label>
                        <input
                            type="number"
                            value={formData.volume}
                            onChange={(e) => setFormData({ ...formData, volume: Number(e.target.value) })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Proteínas (g)</label>
                        <input
                            type="number"
                            value={formData.proteins}
                            onChange={(e) => setFormData({ ...formData, proteins: Number(e.target.value) })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Calorias (kcal)</label>
                        <input
                            type="number"
                            value={formData.calories}
                            onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
                        />
                    </div>
                </div>

                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center mb-4">
                    <input
                      id="hasFlavors"
                      type="checkbox"
                      checked={formData.hasFlavors}
                      onChange={(e) => setFormData({ ...formData, hasFlavors: e.target.checked })}
                      className="h-4 w-4 text-emerald-700 focus:ring-emerald-600 border-gray-300 rounded"
                    />
                    <label htmlFor="hasFlavors" className="ml-2 block text-sm text-gray-900">
                      Este produto possui sabores?
                    </label>
                  </div>

                  {formData.hasFlavors && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sabores</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={newFlavor}
                          onChange={(e) => setNewFlavor(e.target.value)}
                          placeholder="Digite um sabor"
                          className="flex-1 rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFlavor())}
                        />
                        <button
                          type="button"
                          onClick={handleAddFlavor}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        >
                          Adicionar
                        </button>
                      </div>
                      
                      {formData.flavors.length > 0 && (
                        <ul className="space-y-2 mt-2">
                          {formData.flavors.map((flavor, index) => (
                            <li key={index} className="flex justify-between items-center bg-white p-2 rounded border shadow-sm">
                              <span className="text-gray-800">{flavor}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFlavor(index)}
                                className="text-emerald-700 hover:text-emerald-900"
                              >
                                Remover
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center mb-4">
                    <input
                      id="hasAddons"
                      type="checkbox"
                      checked={formData.hasAddons}
                      onChange={(e) => setFormData({ ...formData, hasAddons: e.target.checked })}
                      className="h-4 w-4 text-emerald-700 focus:ring-emerald-600 border-gray-300 rounded"
                    />
                    <label htmlFor="hasAddons" className="ml-2 block text-sm text-gray-900">
                      Este produto possui Adicionais?
                    </label>
                  </div>

                  {formData.hasAddons && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex items-center mb-4">
                        <input
                          id="allowMultipleAddons"
                          type="checkbox"
                          checked={formData.allowMultipleAddons}
                          onChange={(e) => setFormData({ ...formData, allowMultipleAddons: e.target.checked })}
                          className="h-4 w-4 text-emerald-700 focus:ring-emerald-600 border-gray-300 rounded"
                        />
                        <label htmlFor="allowMultipleAddons" className="ml-2 block text-sm text-gray-900">
                          O cliente pode selecionar mais de um adicional?
                        </label>
                      </div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">Adicionais</label>
                      <div className="flex flex-col md:flex-row gap-2 mb-2 items-end">
                        <div className="flex-1 w-full">
                          <label className="block text-xs text-gray-500 mb-1">Nome</label>
                          <input
                            type="text"
                            value={newAddon}
                            onChange={(e) => setNewAddon(e.target.value)}
                            placeholder="Ex: Bacon Extra"
                            className="w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAddon())}
                          />
                        </div>
                        <div className="w-full md:w-32">
                          <label className="block text-xs text-gray-500 mb-1">Preço (R$)</label>
                          <input
                            type="text"
                            value={newAddonPrice}
                            onChange={(e) => setNewAddonPrice(e.target.value)}
                            placeholder="0,00"
                            className="w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAddon())}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddAddon}
                          className="w-full md:w-auto bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 h-[42px]"
                        >
                          Adicionar
                        </button>
                      </div>
                      
                      {formData.addons.length > 0 && (
                        <ul className="space-y-2 mt-2">
                          {formData.addons.map((addon, index) => (
                            <li key={index} className="flex justify-between items-center bg-white p-2 rounded border shadow-sm">
                              <span className="text-gray-800">
                                {addon.name} - <span className="text-green-600 font-medium">R$ {(addon.price || 0).toFixed(2)}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveAddon(index)}
                                className="text-emerald-700 hover:text-emerald-900"
                              >
                                Remover
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                    <label className="flex items-center gap-2 text-sm text-gray-900">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="h-4 w-4 text-emerald-700 focus:ring-emerald-600 border-gray-300 rounded"
                      />
                      Produto ativo
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-900">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="h-4 w-4 text-emerald-700 focus:ring-emerald-600 border-gray-300 rounded"
                      />
                      Destaque
                    </label>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ordenação</label>
                      <input
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
                      />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancelar</button>
                    <button type="submit" disabled={loading} className="bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-emerald-800">
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
      )}

      <div className="space-y-8">
        {categories.map(category => {
            const categoryProducts = products
              .filter(p => p.categoryId === category.id)
              .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            if (categoryProducts.length === 0) return null;

            return (
                <div key={category.id}>
                    <h3 className="font-bold text-lg text-gray-800 mb-3 px-2 py-1 bg-gray-100 rounded border-l-4 border-emerald-700">
                        {category.name}
                    </h3>
                    <div className="space-y-3">
                        {categoryProducts.map(product => (
                            <div key={product.id} className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow gap-4 sm:gap-0 bg-white">
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    {product.imageUrl && (
	                                        <div className="relative w-12 h-12 rounded bg-gray-100 overflow-hidden shrink-0">
	                                            <Image src={product.imageUrl} alt={product.name} fill sizes="48px" className="object-cover" unoptimized />
	                                        </div>
                                    )}
                                    <div>
                                        <h4 className="font-semibold text-gray-800">{product.name}</h4>
                                        <div className="mt-1 flex flex-wrap gap-1.5">
                                          <p className="text-sm text-gray-500">R$ {(product.price || 0).toFixed(2)}</p>
                                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${product.isActive === false ? 'bg-gray-100 text-gray-600' : 'bg-emerald-50 text-emerald-700'}`}>
                                            {product.isActive === false ? 'Inativo' : 'Ativo'}
                                          </span>
                                          {product.isFeatured && (
                                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">Destaque</span>
                                          )}
                                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">Ordem {product.sortOrder || 0}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                    <button onClick={() => handleEdit(product)} className="p-2 text-emerald-700 hover:bg-emerald-50 rounded">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(product.id)} className="p-2 text-emerald-700 hover:bg-emerald-50 rounded">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        })}

        {products.length === 0 && (
            <p className="text-gray-500 text-center py-4">Nenhum produto cadastrado.</p>
        )}
      </div>
    </div>
  );
}
