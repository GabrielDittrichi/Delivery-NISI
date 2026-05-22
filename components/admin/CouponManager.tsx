'use client';
import { useState, useEffect } from 'react';
import { BadgePercent, CalendarX, RefreshCw, ToggleLeft, Trash2, Plus, Tag } from 'lucide-react';
import { AdminEmptyState, AdminPageHeader, AdminSection, AdminStatCard } from './AdminPrimitives';

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

  const activeCoupons = coupons.filter((coupon) => coupon.isActive).length;
  const inactiveCoupons = coupons.filter((coupon) => !coupon.isActive).length;
  const expiredCoupons = coupons.filter((coupon) => coupon.expiresAt && new Date(coupon.expiresAt) < new Date()).length;
  const totalUses = coupons.reduce((total, coupon) => total + (coupon.usedCount || 0), 0);

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
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promocoes"
        title="Cupons"
        description="Crie e acompanhe regras promocionais para campanhas e clientes recorrentes."
        action={
          <button onClick={fetchCoupons} className="inline-flex items-center gap-2 rounded-lg border border-emerald-100 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">
              <RefreshCw size={18} /> Atualizar
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <AdminStatCard label="Ativos" value={activeCoupons} detail="liberados no checkout" icon={BadgePercent} />
        <AdminStatCard label="Inativos" value={inactiveCoupons} detail="pausados" icon={ToggleLeft} />
        <AdminStatCard label="Vencidos" value={expiredCoupons} detail="fora da validade" icon={CalendarX} />
        <AdminStatCard label="Usos totais" value={totalUses} detail="registrados" icon={Tag} />
      </div>

      <AdminSection title="Novo cupom" description="Defina valor, validade e limite antes de divulgar.">
      <form onSubmit={handleCreate} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
                type="text"
                placeholder="Código (ex: PROMO10)"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                className="rounded-lg border border-emerald-100 p-3 uppercase outline-none focus:ring-2 focus:ring-emerald-600"
                required
            />
            <select
                value={newCoupon.type}
                onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                className="rounded-lg border border-emerald-100 bg-white p-3 outline-none focus:ring-2 focus:ring-emerald-600"
            >
                <option value="PERCENTAGE">Porcentagem (%)</option>
                <option value="FIXED">Valor Fixo (R$)</option>
            </select>
            <input
                type="number"
                placeholder="Valor"
                value={newCoupon.value}
                onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                className="rounded-lg border border-emerald-100 p-3 outline-none focus:ring-2 focus:ring-emerald-600"
                required
                min="0"
                step="0.01"
            />
            <input
                type="number"
                placeholder="Pedido mínimo (opcional)"
                value={newCoupon.minOrder}
                onChange={(e) => setNewCoupon({ ...newCoupon, minOrder: e.target.value })}
                className="rounded-lg border border-emerald-100 p-3 outline-none focus:ring-2 focus:ring-emerald-600"
                min="0"
                step="0.01"
            />
            <input
                type="number"
                placeholder="Limite de usos (opcional)"
                value={newCoupon.usageLimit}
                onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
                className="rounded-lg border border-emerald-100 p-3 outline-none focus:ring-2 focus:ring-emerald-600"
                min="0"
                step="1"
            />
            <input
                type="date"
                value={newCoupon.expiresAt}
                onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                className="rounded-lg border border-emerald-100 p-3 outline-none focus:ring-2 focus:ring-emerald-600"
                aria-label="Validade do cupom"
            />
        </div>
        
        <div className="flex justify-between items-center">
            <p className="text-sm text-green-600 font-medium">{message}</p>
            <button
                type="submit"
                disabled={creating || !newCoupon.code}
                className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
            >
                <Plus size={18} /> Criar Cupom
            </button>
        </div>
      </form>
      </AdminSection>

      <AdminSection title="Cupons cadastrados">
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
                                <AdminEmptyState icon={BadgePercent} title="Nenhum cupom encontrado" description="Crie o primeiro cupom para campanhas do cardapio." />
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      )}
      </AdminSection>
    </div>
  );
}
