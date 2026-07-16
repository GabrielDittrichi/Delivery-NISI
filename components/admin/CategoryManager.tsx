'use client'
import { Category } from '@/lib/db';
import { Product } from '@/lib/db';
import { addCategory, deleteCategory, moveCategory } from '@/lib/actions';
import { useState } from 'react';
import { Trash2, Plus, ChevronUp, ChevronDown, ListTree } from 'lucide-react';
import { AdminBadge, AdminEmptyState, AdminPageHeader, AdminSection } from './AdminPrimitives';
import ConfirmDialog from './ConfirmDialog';
import { toast } from 'sonner';
import type { ConfirmConfig } from './ConfirmDialog';

export default function CategoryManager({ categories, products }: { categories: Category[]; products: Product[] }) {
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setLoading(true);
    await addCategory(newCategory);
    setNewCategory('');
    setLoading(false);
    toast.success(`Categoria "${newCategory}" criada com sucesso!`);
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    await moveCategory(id, direction);
  };

  const handleDelete = async (id: string) => {
    const cat = categories.find(c => c.id === id);
    const productCount = products.filter(p => p.categoryId === id).length;
    setConfirm({
      title: 'Excluir categoria',
      message: cat
        ? `Tem certeza que deseja excluir "${cat.name}"? ${productCount > 0 ? `Todos os ${productCount} produto${productCount > 1 ? 's' : ''} desta categoria também serão excluídos permanentemente.` : 'Não há produtos nesta categoria.'}`
        : 'Tem certeza?',
      destructive: true,
      confirmLabel: 'Excluir categoria',
      onConfirm: async () => {
        await deleteCategory(id);
        toast.success('Categoria excluída com sucesso!');
      },
    });
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Organização"
        title="Categorias"
        description="Organize o cardápio na mesma ordem que o cliente vai navegar no site."
      />
      
      <AdminSection title="Nova categoria" description="Use nomes curtos para facilitar a leitura no celular.">
        <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row">
          <input
              type="text"
              placeholder="Nome da categoria"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 rounded-lg border border-emerald-100 p-3 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <button
              type="submit"
              disabled={loading || !newCategory.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
              <Plus size={18} /> Adicionar
          </button>
        </form>
      </AdminSection>

      <div className="mt-6">
        <AdminSection title="Ordem do cardápio">
          {categories.length === 0 ? (
            <AdminEmptyState icon={ListTree} title="Nenhuma categoria cadastrada" description="Crie a primeira categoria para organizar os produtos do cardápio." />
          ) : (
            <ul className="space-y-3">
              {categories.map((cat, index) => {
                const productCount = products.filter((product) => product.categoryId === cat.id).length;
                return (
                  <li key={cat.id} className="flex flex-col gap-3 rounded-lg border border-emerald-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-950">{cat.name}</span>
                        <AdminBadge tone={productCount > 0 ? 'green' : 'gray'}>{productCount} produtos</AdminBadge>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Posição {index + 1} no cardápio.</p>
                    </div>
                    <div className="flex items-center gap-1 self-end sm:self-auto">
                      <button onClick={() => handleMove(cat.id, 'up')} disabled={index === 0} className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-emerald-50 hover:text-emerald-800 disabled:opacity-30" title={`Mover ${cat.name} para cima`} aria-label={`Mover ${cat.name} para cima`}>
                        <ChevronUp size={20} />
                      </button>
                      <button onClick={() => handleMove(cat.id, 'down')} disabled={index === categories.length - 1} className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-emerald-50 hover:text-emerald-800 disabled:opacity-30" title={`Mover ${cat.name} para baixo`} aria-label={`Mover ${cat.name} para baixo`}>
                        <ChevronDown size={20} />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="rounded-lg p-2 text-emerald-700 transition-colors hover:bg-emerald-50 hover:text-emerald-900" title={`Excluir ${cat.name}`} aria-label={`Excluir ${cat.name}`}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </AdminSection>
      </div>

      <ConfirmDialog config={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
}
