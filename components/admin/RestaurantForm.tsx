'use client'
import { Restaurant } from '@/lib/db';
import { updateRestaurant } from '@/lib/actions';
import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import { AdminPageHeader, AdminSection } from './AdminPrimitives';
import { toast } from 'sonner';

export default function RestaurantForm({ restaurant }: { restaurant: Restaurant }) {
  const [formData, setFormData] = useState(restaurant);
  const [loading, setLoading] = useState(false);

  const formatWhatsapp = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 13);
    if (digits.startsWith('55')) {
      const area = digits.slice(2, 4);
      const number = digits.slice(4);
      if (!area) return '+55';
      if (number.length <= 5) return `+55 (${area}) ${number}`;
      return `+55 (${area}) ${number.slice(0, 5)}-${number.slice(5, 9)}`;
    }
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handleWhatsappChange = (value: string) => {
    const raw = value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, whatsapp: raw }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateRestaurant(formData);
    setLoading(false);
    toast.success('Configurações salvas com sucesso!');
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Configurações"
        title="Restaurante"
        description="Controle identidade, atendimento, mídia e informações exibidas no cardápio."
      />
      <form onSubmit={handleSubmit} className="space-y-4">
        <AdminSection title="Identidade" description="Essas informações aparecem no topo do site e no cardápio presencial.">
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
        </AdminSection>

        <AdminSection title="Atendimento" description="Dados usados para orientar entrega, retirada e contato.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
            <input
              type="tel"
              value={formatWhatsapp(formData.whatsapp || '')}
              onChange={(e) => handleWhatsappChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
              placeholder="+55 (31) 99999-9999"
            />
            <p className="mt-1 text-xs text-gray-500">Salve com DDI, DDD e 9 dígitos. Ex: 5531999999999</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Horário de funcionamento</label>
            <input
              type="text"
              value={formData.businessHours || ''}
              onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
              placeholder="Seg a Sex, 8h às 18h"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Endereço</label>
          <input
            type="text"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Texto institucional</label>
          <textarea
            value={formData.institutionalText || ''}
            onChange={(e) => setFormData({ ...formData, institutionalText: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
            rows={3}
          />
        </div>
        </AdminSection>

        <AdminSection title="Mídia" description="Atualize logo e banner mantendo imagens claras e bem enquadradas.">
         <div>
          <ImageUpload
            label="Banner do Restaurante"
            value={formData.bannerUrl || ''}
            onChange={(url) => setFormData({ ...formData, bannerUrl: url })}
            enableCrop={true}
            aspect={3 / 1}
          />
        </div>
         <div>
          <ImageUpload
            label="Logo do Restaurante"
            value={formData.logoUrl || ''}
            onChange={(url) => setFormData({ ...formData, logoUrl: url })}
            enableCrop={true}
            aspect={1}
          />
        </div>
        </AdminSection>

        <AdminSection title="Operação" description="Ajustes usados nos resumos e mensagens do cardápio.">
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
                value={formData.deliveryTime || ''}
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
        </AdminSection>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
}
