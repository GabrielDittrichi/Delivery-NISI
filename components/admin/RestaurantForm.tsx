'use client'
import { Restaurant } from '@/lib/db';
import { updateRestaurant } from '@/lib/actions';
import { useState } from 'react';

export default function RestaurantForm({ restaurant }: { restaurant: Restaurant }) {
  const [formData, setFormData] = useState(restaurant);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateRestaurant(formData);
    setLoading(false);
    alert('Salvo com sucesso!');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Informações do Restaurante</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
            rows={3}
          />
        </div>
         <div>
          <label className="block text-sm font-medium text-gray-700">Banner URL</label>
          <input
            type="text"
            value={formData.bannerUrl}
            onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
          />
        </div>
         <div>
          <label className="block text-sm font-medium text-gray-700">Logo URL</label>
          <input
            type="text"
            value={formData.logoUrl}
            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Cor Primária</label>
          <div className="flex items-center gap-2">
            <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="mt-1 block w-12 h-10 rounded-md border-gray-300 shadow-sm border p-1"
            />
            <span className="text-gray-600">{formData.primaryColor}</span>
          </div>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Avaliação</label>
              <input
                type="number"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tempo Entrega</label>
              <input
                type="text"
                value={formData.deliveryTime}
                onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Pedido Min.</label>
              <input
                type="number"
                step="0.01"
                value={formData.minOrder}
                onChange={(e) => setFormData({ ...formData, minOrder: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
              />
            </div>
         </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
}
