'use client';
import { useState, useEffect } from 'react';
import { Trash2, Plus, Tag, RefreshCw } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  isActive: boolean;
  expiresAt?: string | null;
  usageLimit?: number | null;
  usedCount?: number;
  minOrder?: number;
}

export default function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: '',
    minOrder: '',
    usageLimit: '',
    expiresAt: '',
  });
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/coupons');
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.value) return;

    setCreating(true);
    setMessage('');

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || 'Erro ao criar cupom');
      } else {
        setCoupons([data, ...coupons]);
        setNewCoupon({ code: '', type: 'PERCENTAGE', value: '', minOrder: '', usageLimit: '', expiresAt: '' });
        setMessage('Cupom criado com sucesso!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch {
      setMessage('Erro ao criar cupom');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cupom?')) return;

    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCoupons(coupons.filter((c) => c.id !== id));
      } else {
        alert('Erro ao excluir cupom');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
        const res = await fetch(`/api/coupons/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: !currentStatus })
        });
        
        if (res.ok) {
            setCoupons(coupons.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
        }
    } catch (error) {
        console.error('Error toggling coupon:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Tag size={20} />
            Gerenciar Cupons
        </h2>
        <button onClick={fetchCoupons} className="text-gray-500 hover:text-green-600">
            <RefreshCw size={20} />
        </button>
      </div>

      <form onSubmit={handleCreate} className="bg-gray-50 p-4 rounded-lg border mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
                type="text"
                placeholder="Código (ex: PROMO10)"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                className="border rounded-md p-2 uppercase"
                required
            />
            <select
                value={newCoupon.type}
                onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                className="border rounded-md p-2 bg-white"
            >
                <option value="PERCENTAGE">Porcentagem (%)</option>
                <option value="FIXED">Valor Fixo (R$)</option>
            </select>
            <input
                type="number"
                placeholder="Valor"
                value={newCoupon.value}
                onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                className="border rounded-md p-2"
                required
                min="0"
                step="0.01"
            />
            <input
                type="number"
                placeholder="Pedido mínimo (opcional)"
                value={newCoupon.minOrder}
                onChange={(e) => setNewCoupon({ ...newCoupon, minOrder: e.target.value })}
                className="border rounded-md p-2"
                min="0"
                step="0.01"
            />
            <input
                type="number"
                placeholder="Limite de usos (opcional)"
                value={newCoupon.usageLimit}
                onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
                className="border rounded-md p-2"
                min="0"
                step="1"
            />
            <input
                type="date"
                value={newCoupon.expiresAt}
                onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                className="border rounded-md p-2"
                aria-label="Validade do cupom"
            />
        </div>
        
        <div className="flex justify-between items-center">
            <p className="text-sm text-green-600 font-medium">{message}</p>
            <button
                type="submit"
                disabled={creating || !newCoupon.code}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
                <Plus size={18} /> Criar Cupom
            </button>
        </div>
      </form>

      {loading ? (
        <p className="text-center text-gray-500 py-8">Carregando...</p>
      ) : (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-100 border-b">
                        <th className="p-3 font-medium text-gray-600">Código</th>
                        <th className="p-3 font-medium text-gray-600">Tipo</th>
                        <th className="p-3 font-medium text-gray-600">Valor</th>
                        <th className="p-3 font-medium text-gray-600">Regras</th>
                        <th className="p-3 font-medium text-gray-600">Status</th>
                        <th className="p-3 font-medium text-gray-600 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {coupons.map((coupon) => (
                        <tr key={coupon.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-mono font-medium text-gray-900">{coupon.code}</td>
                            <td className="p-3 text-gray-600">
                                {coupon.type === 'PERCENTAGE' ? 'Porcentagem' : 'Fixo'}
                            </td>
                            <td className="p-3 text-gray-600">
                                {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `R$ ${coupon.value.toFixed(2)}`}
                            </td>
                            <td className="p-3 text-xs text-gray-600">
                                <div>Min: R$ {(coupon.minOrder || 0).toFixed(2).replace('.', ',')}</div>
                                <div>Usos: {coupon.usedCount || 0}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}</div>
                                {coupon.expiresAt && <div>Val: {new Date(coupon.expiresAt).toLocaleDateString('pt-BR')}</div>}
                            </td>
                            <td className="p-3">
                                <button
                                    onClick={() => handleToggleActive(coupon.id, coupon.isActive)}
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                        coupon.isActive 
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {coupon.isActive ? 'Ativo' : 'Inativo'}
                                </button>
                            </td>
                            <td className="p-3 text-right">
                                <button
                                    onClick={() => handleDelete(coupon.id)}
                                    className="text-emerald-700 hover:text-emerald-900 p-2"
                                    title="Excluir"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {coupons.length === 0 && (
                        <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-500">
                                Nenhum cupom encontrado.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
}
