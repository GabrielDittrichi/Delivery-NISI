'use client'
import { Category } from '@/lib/db';
import { addCategory, deleteCategory, moveCategory } from '@/lib/actions';
import { useState } from 'react';
import { Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setLoading(true);
    await addCategory(newCategory);
    setNewCategory('');
    setLoading(false);
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    await moveCategory(id, direction);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
        await deleteCategory(id);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Gerenciar Categorias</h2>
      
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
            type="text"
            placeholder="Nova Categoria"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1 rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
        />
        <button 
            type="submit" 
            disabled={loading || !newCategory.trim()}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
            <Plus size={18} /> Adicionar
        </button>
      </form>

      <ul className="space-y-2">
        {categories.map((cat, index) => (
            <li key={cat.id} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                <span className="font-medium text-gray-800">{cat.name}</span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleMove(cat.id, 'up')}
                        disabled={index === 0}
                        className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-30 hover:bg-gray-200 rounded-full transition-colors"
                        title="Mover para cima"
                    >
                        <ChevronUp size={20} />
                    </button>
                    <button
                        onClick={() => handleMove(cat.id, 'down')}
                        disabled={index === categories.length - 1}
                        className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-30 hover:bg-gray-200 rounded-full transition-colors"
                        title="Mover para baixo"
                    >
                        <ChevronDown size={20} />
                    </button>
                    <div className="w-px h-6 bg-gray-300 mx-2"></div>
                    <button 
                        onClick={() => handleDelete(cat.id)}
                        className="text-emerald-700 hover:text-emerald-900 p-2 hover:bg-emerald-50 rounded-full transition-colors"
                        title="Excluir"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </li>
        ))}
        {categories.length === 0 && (
            <p className="text-gray-500 text-center py-4">Nenhuma categoria cadastrada.</p>
        )}
      </ul>
    </div>
  );
}
