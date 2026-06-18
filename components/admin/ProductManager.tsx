'use client'
import { Category, Product } from '@/lib/db';
import { addProduct, deleteProduct, duplicateProduct, updateProduct } from '@/lib/actions';
import { useMemo, useRef, useState, useEffect } from 'react';
import { Trash2, Plus, Edit2, Copy, X, ImageOff, Search, ShoppingBag, Sparkles, ToggleLeft } from 'lucide-react';
import ImageUpload from './ImageUpload';
import Image from 'next/image';
import { AdminEmptyState, AdminPageHeader, AdminSection, AdminStatCard } from './AdminPrimitives';
import ConfirmDialog from './ConfirmDialog';
import { toast } from 'sonner';
import type { ConfirmConfig } from './ConfirmDialog';

export default function ProductManager({ categories, products }: { categories: Category[], products: Product[] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const initialFormState = {
    categoryId: categories[0]?.id || '',
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    galleryImage1: '',
    galleryImage2: '',
    galleryImage3: '',
    videoUrl: '',
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

  const visibleProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(term) || product.description.toLowerCase().includes(term);
      const matchesCategory = categoryFilter === 'ALL' || product.categoryId === categoryFilter;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && product.isActive !== false) ||
        (statusFilter === 'INACTIVE' && product.isActive === false) ||
        (statusFilter === 'FEATURED' && product.isFeatured) ||
        (statusFilter === 'NO_IMAGE' && !product.imageUrl);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [categoryFilter, products, searchTerm, statusFilter]);

  const activeCount = products.filter((product) => product.isActive !== false).length;
  const featuredCount = products.filter((product) => product.isFeatured).length;
  const noImageCount = products.filter((product) => !product.imageUrl).length;

  const resetForm = () => {
    setFormData({
        ...initialFormState,
        categoryId: categories[0]?.id || ''
    });
    setIsEditing(false);
    setEditingId(null);
    setSaveError('');
  }

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEditing) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isEditing]);

  const handleEdit = (product: Product) => {
    setFormData({
        categoryId: product.categoryId,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl || '',
        galleryImage1: product.galleryImage1 || '',
        galleryImage2: product.galleryImage2 || '',
        galleryImage3: product.galleryImage3 || '',
        videoUrl: product.videoUrl || '',
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
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
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
    setSaveError('');
    try {
        if (editingId) {
            await updateProduct({ ...formData, id: editingId });
            toast.success('Produto atualizado com sucesso!');
        } else {
            await addProduct(formData);
            toast.success('Produto criado com sucesso!');
        }
        resetForm();
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Erro desconhecido ao salvar';
        setSaveError(msg);
        console.error('Error saving product:', error);
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const product = products.find(p => p.id === id);
    setConfirm({
      title: 'Excluir produto',
      message: product
        ? `Tem certeza que deseja excluir "${product.name}"? Esta acao nao pode ser desfeita.`
        : 'Tem certeza que deseja excluir este produto?',
      destructive: true,
      confirmLabel: 'Excluir',
      onConfirm: async () => {
        await deleteProduct(id);
        toast.success('Produto excluido com sucesso!');
      },
    });
  }

  const handleImageUploaded = (url: string) => {
      setFormData(prev => ({ ...prev, imageUrl: url }));
  }

  const handleMediaUploaded = (field: 'galleryImage1' | 'galleryImage2' | 'galleryImage3' | 'videoUrl', url: string) => {
      setFormData(prev => ({ ...prev, [field]: url }));
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Cardápio"
        title="Produtos"
        description="Gerencie fotos, categorias, sabores, adicionais e visibilidade dos itens."
        action={
          <button onClick={() => { resetForm(); setIsEditing(true); }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800">
            <Plus size={18} /> Novo produto
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <AdminStatCard label="Cadastrados" value={products.length} detail="itens no cardapio" icon={ToggleLeft} />
        <AdminStatCard label="Ativos" value={activeCount} detail="visiveis no site" icon={Sparkles} />
        <AdminStatCard label="Destaques" value={featuredCount} detail="prioridade na vitrine" icon={Sparkles} />
        <AdminStatCard label="Sem foto" value={noImageCount} detail="precisam de foto" icon={ImageOff} />
      </div>

      {isEditing && (
        <AdminSection
          title={editingId ? 'Editar produto' : 'Novo produto'}
          description="Organize as informações em seções curtas para evitar erros no cadastro."
          action={<button onClick={resetForm} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"><X size={20} /></button>}
        >
        <div ref={formRef}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Imagem do produto</h3>
            </div>
            
            <div className="mb-4">
                <ImageUpload onUploadComplete={handleImageUploaded} />
            </div>

            <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50/40 p-4">
                <h3 className="font-semibold text-gray-900">Galeria do produto</h3>
                <p className="mt-1 text-sm text-gray-600">Adicione até três fotos extras e um vídeo para aparecer na página do produto.</p>
                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                        <ImageUpload title="Foto extra 1" onUploadComplete={(url) => handleMediaUploaded('galleryImage1', url)} />
                        <input
                            type="url"
                            value={formData.galleryImage1}
                            onChange={(e) => setFormData({ ...formData, galleryImage1: e.target.value })}
                            placeholder="URL da foto extra 1"
                            className="mt-2 block w-full rounded-md border border-emerald-100 p-2 text-sm text-gray-900"
                        />
                    </div>
                    <div>
                        <ImageUpload title="Foto extra 2" onUploadComplete={(url) => handleMediaUploaded('galleryImage2', url)} />
                        <input
                            type="url"
                            value={formData.galleryImage2}
                            onChange={(e) => setFormData({ ...formData, galleryImage2: e.target.value })}
                            placeholder="URL da foto extra 2"
                            className="mt-2 block w-full rounded-md border border-emerald-100 p-2 text-sm text-gray-900"
                        />
                    </div>
                    <div>
                        <ImageUpload title="Foto extra 3" onUploadComplete={(url) => handleMediaUploaded('galleryImage3', url)} />
                        <input
                            type="url"
                            value={formData.galleryImage3}
                            onChange={(e) => setFormData({ ...formData, galleryImage3: e.target.value })}
                            placeholder="URL da foto extra 3"
                            className="mt-2 block w-full rounded-md border border-emerald-100 p-2 text-sm text-gray-900"
                        />
                    </div>
                    <div>
                        <ImageUpload title="Video do produto" accept="video/*" onUploadComplete={(url) => handleMediaUploaded('videoUrl', url)} />
                        <input
                            type="url"
                            value={formData.videoUrl}
                            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                            placeholder="URL do video"
                            className="mt-2 block w-full rounded-md border border-emerald-100 p-2 text-sm text-gray-900"
                        />
                    </div>
                </div>
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
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFlavor())}
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
                          Cliente pode escolher vários adicionais no mesmo item?
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
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAddon())}
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
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAddon())}
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

                {saveError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
                    {saveError}
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancelar</button>
                    <button type="submit" disabled={loading} className="bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-emerald-800">
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
        </AdminSection>
      )}

      <AdminSection
        title="Catalogo"
        description="Filtre por categoria, status ou produtos que precisam de foto."
        action={
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-emerald-100 py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        }
      >
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setCategoryFilter('ALL')} className={`rounded-lg px-3 py-2 text-sm font-semibold ${categoryFilter === 'ALL' ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-emerald-50'}`}>Todas categorias</button>
        {categories.map((category) => (
          <button key={category.id} onClick={() => setCategoryFilter(category.id)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${categoryFilter === category.id ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-emerald-50'}`}>
            {category.name}
          </button>
        ))}
        {[
          ['ALL', 'Todos status'],
          ['ACTIVE', 'Ativos'],
          ['INACTIVE', 'Inativos'],
          ['FEATURED', 'Destaques'],
          ['NO_IMAGE', 'Sem foto'],
        ].map(([value, label]) => (
          <button key={value} onClick={() => setStatusFilter(value)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${statusFilter === value ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-emerald-50'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {categories.map(category => {
            const categoryProducts = visibleProducts
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
	                                            <Image src={product.imageUrl} alt={product.name} fill sizes="48px" className="object-cover" />
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
                                    <button onClick={() => { duplicateProduct(product.id); toast.success('Produto duplicado!'); }} className="p-2 text-gray-500 hover:bg-emerald-50 rounded" title="Duplicar">
                                        <Copy size={18} />
                                    </button>
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

        {visibleProducts.length === 0 && (
            <AdminEmptyState icon={ShoppingBag} title="Nenhum produto encontrado" description="Ajuste os filtros ou cadastre um novo item para o cardapio." />
        )}
      </div>
      </AdminSection>

      <ConfirmDialog config={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
}
