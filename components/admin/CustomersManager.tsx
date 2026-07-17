'use client';

import {
  BadgeDollarSign,
  Copy,
  Download,
  Gift,
  HeartHandshake,
  MessageCircle,
  PackageSearch,
  Repeat,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AdminBadge, AdminEmptyState, AdminPageHeader, AdminSection, AdminStatCard } from './AdminPrimitives';
import type { Order } from './OrdersManager';

export interface Customer {
  name: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  deliveryMethod: string;
  ordersCount: number;
  firstOrderAt?: Date | string;
  lastOrderAt: Date | string;
  daysSinceLastOrder?: number;
  totalSpent: number;
  averageTicket?: number;
  relationshipStatus?: string;
  repurchaseProbability?: string;
  suggestedApproach?: string;
  tags?: string[];
  favoriteProduct?: { name: string; quantity: number; total: number } | null;
  favoriteCategory?: string;
  favoriteFlavor?: string;
  favoriteAddon?: string;
  topProducts?: { name: string; quantity: number; total: number }[];
}

const customerCurrencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const GOOGLE_REVIEW_URL = 'https://share.google/l7RQjgBJFXc0wWh37';

const segmentFilters = [
  'Todos',
  'Novo cliente',
  'Recorrente',
  'VIP',
  'Inativo',
  'Alto ticket',
  'Comprou shake',
  'Comprou salgado',
  'Prefere entrega',
  'Prefere retirada',
];

const tagTone = (tag: string): 'green' | 'gray' | 'amber' => {
  if (tag === 'VIP' || tag === 'Recorrente' || tag === 'Alto ticket') return 'green';
  if (tag === 'Inativo' || tag === 'Quase inativo') return 'amber';
  return 'gray';
};

export default function CustomersManager({
  initialCustomers,
  initialOrders,
}: {
  initialCustomers: Customer[];
  initialOrders: Order[];
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('Todos');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const normalizePhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.startsWith('55') && digits.length > 11 ? digits.slice(2) : digits;
  };

  const customers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const phoneTerm = searchTerm.replace(/\D/g, '');

    return initialCustomers.filter((customer) => {
      const tags = customer.tags || [];
      const matchesSegment = selectedSegment === 'Todos' || tags.includes(selectedSegment);
      const matchesSearch =
        customer.name.toLowerCase().includes(term) ||
        normalizePhone(customer.phone).includes(phoneTerm) ||
        customer.neighborhood.toLowerCase().includes(term) ||
        tags.some((tag) => tag.toLowerCase().includes(term)) ||
        customer.favoriteProduct?.name.toLowerCase().includes(term);

      return matchesSegment && matchesSearch;
    });
  }, [initialCustomers, searchTerm, selectedSegment]);

  const recurringCustomers = initialCustomers.filter((customer) => customer.ordersCount > 1).length;
  const vipCustomers = initialCustomers.filter((customer) => customer.tags?.includes('VIP')).length;
  const inactiveCustomers = initialCustomers.filter((customer) => customer.tags?.includes('Inativo')).length;
  const totalRevenue = initialCustomers.reduce((total, customer) => total + customer.totalSpent, 0);
  const averageTicket = initialCustomers.length > 0 ? totalRevenue / initialCustomers.length : 0;
  const bestCustomer = initialCustomers.slice().sort((a, b) => b.totalSpent - a.totalSpent)[0];

  const selectedOrders = selectedCustomer
    ? initialOrders.filter((order) => normalizePhone(order.customerPhone) === normalizePhone(selectedCustomer.phone))
    : [];

  const productInsights = useMemo(() => {
    const productMap = new Map<string, { name: string; quantity: number; customers: Set<string>; total: number }>();

    initialCustomers.forEach((customer) => {
      customer.topProducts?.forEach((product) => {
        const current = productMap.get(product.name) || { name: product.name, quantity: 0, customers: new Set<string>(), total: 0 };
        current.quantity += product.quantity;
        current.total += product.total;
        current.customers.add(customer.phone);
        productMap.set(product.name, current);
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.customers.size - a.customers.size || b.quantity - a.quantity)
      .slice(0, 4);
  }, [initialCustomers]);

  const formatCurrency = (value: number) => customerCurrencyFormatter.format(value);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (date?: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };

  const formatPhone = (value: string) => {
    const localDigits = normalizePhone(value);
    if (localDigits.length <= 2) return localDigits;
    if (localDigits.length <= 7) return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2)}`;
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 7)}-${localDigits.slice(7, 11)}`;
  };

  const getWhatsappNumber = (phone: string) => {
    const digits = normalizePhone(phone);
    return digits.startsWith('55') ? digits : `55${digits}`;
  };

  const getDeliveryMethodLabel = (deliveryMethod?: string) => {
    return deliveryMethod === 'PICKUP' ? 'Retirada' : 'Entrega';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendente';
      case 'CONFIRMED': return 'Confirmado';
      case 'DELIVERED': return 'Entregue';
      case 'CANCELED': return 'Cancelado';
      default: return status;
    }
  };

  const getWhatsappMessage = (customer: Customer, action: string) => {
    const firstName = customer.name.split(' ')[0] || customer.name;
    const favoriteProduct = customer.favoriteProduct?.name || 'uma opção leve do cardápio';

    switch (action) {
      case 'thanks':
        return `Oi, ${firstName}! Aqui é do Espaço Vida Saudável NISI. Passando para agradecer seu pedido. Esperamos que tenha gostado.`;
      case 'review':
        return `Oi, ${firstName}! Que bom ter você com a gente no NISI. Se puder, sua avaliação no Google ajuda muito nosso espaço a crescer: ${GOOGLE_REVIEW_URL}`;
      case 'favorite':
        return `Oi, ${firstName}! Vi que você gosta bastante de ${favoriteProduct}. Hoje estamos atendendo normalmente, quer que eu separe um para você?`;
      case 'inactive':
        return `Oi, ${firstName}! Faz um tempinho que você não aparece no NISI. Hoje temos opções leves e proteicas para sua rotina. Quer ver as sugestões do dia?`;
      case 'returnCoupon':
        return `Oi, ${firstName}! Preparamos um cupom para sua próxima compra no NISI. Ele vale para pedidos pelo nosso cardápio digital.`;
      case 'vipCoupon':
        return `Oi, ${firstName}! Você está entre nossos clientes especiais no NISI. Temos uma condição VIP para sua próxima compra. Quer que eu te envie?`;
      default:
        return `Oi, ${firstName}! Aqui é do Espaço Vida Saudável NISI. Posso te ajudar com seu próximo pedido?`;
    }
  };

  const openWhatsapp = (customer: Customer, action: string) => {
    const message = getWhatsappMessage(customer, action);
    window.open(`https://wa.me/${getWhatsappNumber(customer.phone)}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const exportCustomers = () => {
    const headers = [
      'Nome',
      'Telefone',
      'CEP',
      'Endereço',
      'Bairro',
      'Cidade',
      'Tipo preferido',
      'Pedidos',
      'Primeiro pedido',
      'Último pedido',
      'Dias sem compra',
      'Total comprado',
      'Ticket médio',
      'Status',
      'Produto favorito',
      'Etiquetas',
    ];
    const rows = customers.map((customer) => [
      customer.name,
      formatPhone(customer.phone),
      customer.cep,
      customer.street ? `${customer.street}, ${customer.number}` : 'Retirada no local',
      customer.neighborhood,
      customer.city,
      getDeliveryMethodLabel(customer.deliveryMethod),
      String(customer.ordersCount),
      formatShortDate(customer.firstOrderAt),
      formatDate(customer.lastOrderAt),
      String(customer.daysSinceLastOrder ?? 0),
      formatCurrency(customer.totalSpent),
      formatCurrency(customer.averageTicket || 0),
      customer.relationshipStatus || '',
      customer.favoriteProduct?.name || '',
      (customer.tags || []).join(' | '),
    ]);

    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crm-clientes-nisi-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyPhone = async (phone: string) => {
    await navigator.clipboard.writeText(getWhatsappNumber(phone));
    toast.success('Telefone copiado!');
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="CRM"
        title="Clientes"
        description="Perfil por telefone, etiquetas automáticas, preferências de compra e ações rápidas para relacionamento."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard label="Clientes" value={initialCustomers.length} detail="contatos únicos" icon={Users} />
        <AdminStatCard label="Recorrentes" value={recurringCustomers} detail="mais de um pedido" icon={Repeat} />
        <AdminStatCard label="VIP" value={vipCustomers} detail="alto valor ou frequência" icon={Star} />
        <AdminStatCard label="Inativos" value={inactiveCustomers} detail="30 dias sem compra" icon={HeartHandshake} />
        <AdminStatCard label="Ticket médio" value={formatCurrency(averageTicket)} detail={bestCustomer?.name || 'base geral'} icon={BadgeDollarSign} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="flex gap-3 rounded-lg border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-gray-700">
          <ShieldCheck className="mt-0.5 shrink-0 text-emerald-700" size={18} />
          <p>
            Os dados vêm dos pedidos e são agrupados por telefone. Use as etiquetas para atendimento, relacionamento e campanhas do NISI com consentimento do cliente.
          </p>
        </div>

        <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <PackageSearch size={18} className="text-emerald-700" />
            <h3 className="font-bold text-gray-950">Produtos com recompra</h3>
          </div>
          {productInsights.length === 0 ? (
            <p className="text-sm text-gray-500">Os insights aparecem após os primeiros pedidos.</p>
          ) : (
            <div className="space-y-2">
              {productInsights.map((product) => (
                <div key={product.name} className="flex items-center justify-between gap-3 rounded-lg bg-emerald-50/60 px-3 py-2 text-sm">
                  <span className="font-semibold text-gray-800">{product.name}</span>
                  <span className="text-xs text-gray-500">{product.customers.size} clientes</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AdminSection
        title="Base de clientes"
        description="Filtre por etiqueta, busque por nome, telefone, bairro ou produto favorito."
        action={
          <div className="flex w-full flex-col gap-2 lg:w-auto lg:flex-row">
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar cliente..."
                className="w-full rounded-lg border border-emerald-100 py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-600"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={exportCustomers}
              disabled={customers.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-100 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
            >
              <Download size={18} /> Exportar CSV
            </button>
          </div>
        }
      >
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {segmentFilters.map((segment) => (
            <button
              key={segment}
              type="button"
              onClick={() => setSelectedSegment(segment)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                selectedSegment === segment
                  ? 'border-emerald-700 bg-emerald-700 text-white'
                  : 'border-emerald-100 bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-800'
              }`}
            >
              <SlidersHorizontal size={15} />
              {segment}
            </button>
          ))}
        </div>

        {customers.length === 0 ? (
          <AdminEmptyState icon={Users} title="Nenhum cliente encontrado" description="Os clientes aparecem aqui depois dos pedidos concluídos no checkout." />
        ) : (
          <>
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full min-w-[1080px] text-left">
                <thead>
                  <tr className="border-b bg-emerald-50/60 text-sm text-emerald-950">
                    <th className="p-3 font-semibold">Cliente</th>
                    <th className="p-3 font-semibold">Etiquetas</th>
                    <th className="p-3 font-semibold">Produto favorito</th>
                    <th className="p-3 font-semibold">Perfil</th>
                    <th className="p-3 font-semibold">Último pedido</th>
                    <th className="p-3 font-semibold text-right">Comprou</th>
                    <th className="p-3 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.phone} className="border-b text-sm hover:bg-gray-50">
                      <td className="p-3">
                        <button type="button" onClick={() => setSelectedCustomer(customer)} className="text-left">
                          <div className="font-semibold text-gray-950 hover:text-emerald-800">{customer.name}</div>
                          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                            <span>{formatPhone(customer.phone)}</span>
                            <span>{customer.neighborhood || getDeliveryMethodLabel(customer.deliveryMethod)}</span>
                          </div>
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex max-w-xs flex-wrap gap-1.5">
                          {(customer.tags || []).slice(0, 4).map((tag) => (
                            <AdminBadge key={tag} tone={tagTone(tag)}>{tag}</AdminBadge>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-gray-700">
                        <div className="font-semibold text-gray-950">{customer.favoriteProduct?.name || '-'}</div>
                        {customer.favoriteCategory && <div className="text-xs text-gray-500">{customer.favoriteCategory}</div>}
                      </td>
                      <td className="p-3 text-gray-600">
                        <div>{customer.relationshipStatus || 'Cliente'}</div>
                        <div className="text-xs text-gray-500">Recompra {customer.repurchaseProbability || 'Baixa'}</div>
                      </td>
                      <td className="p-3 text-gray-600">
                        <div>{formatDate(customer.lastOrderAt)}</div>
                        <div className="text-xs text-gray-500">{customer.daysSinceLastOrder ?? 0} dias sem compra</div>
                      </td>
                      <td className="p-3 text-right font-semibold text-gray-950">{formatCurrency(customer.totalSpent)}</td>
                      <td className="p-3">
                        <div className="flex justify-end gap-1">
                          <button type="button" onClick={() => copyPhone(customer.phone)} className="rounded p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700" title={`Copiar telefone de ${customer.name}`} aria-label={`Copiar telefone de ${customer.name}`}>
                            <Copy size={16} />
                          </button>
                          <button type="button" onClick={() => openWhatsapp(customer, 'favorite')} className="rounded p-2 text-emerald-700 hover:bg-emerald-50" title={`Abrir WhatsApp de ${customer.name}`} aria-label={`Abrir WhatsApp de ${customer.name}`}>
                            <MessageCircle size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-3 xl:hidden">
              {customers.map((customer) => (
                <button
                  key={customer.phone}
                  type="button"
                  onClick={() => setSelectedCustomer(customer)}
                  className="rounded-lg border border-emerald-100 bg-white p-4 text-left shadow-sm transition-colors hover:bg-emerald-50/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-950">{customer.name}</p>
                      <p className="mt-1 text-sm text-gray-500">{formatPhone(customer.phone)} • {customer.neighborhood || getDeliveryMethodLabel(customer.deliveryMethod)}</p>
                    </div>
                    <span className="rounded-lg bg-emerald-50 px-2 py-1 text-sm font-bold text-emerald-800">{formatCurrency(customer.totalSpent)}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(customer.tags || []).slice(0, 5).map((tag) => (
                      <AdminBadge key={tag} tone={tagTone(tag)}>{tag}</AdminBadge>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg bg-gray-50 p-2">
                      <p className="text-xs text-gray-500">Favorito</p>
                      <p className="truncate font-semibold text-gray-900">{customer.favoriteProduct?.name || '-'}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-2">
                      <p className="text-xs text-gray-500">Último pedido</p>
                      <p className="font-semibold text-gray-900">{formatShortDate(customer.lastOrderAt)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </AdminSection>

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30 p-0 sm:items-center sm:justify-center sm:p-4" role="dialog" aria-modal="true">
          <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-lg bg-white p-4 shadow-xl sm:max-w-5xl sm:rounded-lg sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Perfil do cliente</p>
                <h3 className="mt-1 text-xl font-bold text-gray-950">{selectedCustomer.name}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  <span>{formatPhone(selectedCustomer.phone)}</span>
                  <AdminBadge tone={tagTone(selectedCustomer.relationshipStatus || '')}>{selectedCustomer.relationshipStatus || 'Cliente'}</AdminBadge>
                  <AdminBadge tone="gray">Recompra {selectedCustomer.repurchaseProbability || 'Baixa'}</AdminBadge>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedCustomer(null)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" title="Fechar detalhes" aria-label="Fechar detalhes">
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                <p className="text-xs text-gray-500">Pedidos</p>
                <p className="mt-1 text-xl font-bold text-gray-950">{selectedCustomer.ordersCount}</p>
              </div>
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                <p className="text-xs text-gray-500">Total gasto</p>
                <p className="mt-1 text-xl font-bold text-gray-950">{formatCurrency(selectedCustomer.totalSpent)}</p>
              </div>
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                <p className="text-xs text-gray-500">Ticket médio</p>
                <p className="mt-1 text-xl font-bold text-gray-950">{formatCurrency(selectedCustomer.averageTicket || 0)}</p>
              </div>
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                <p className="text-xs text-gray-500">Primeiro pedido</p>
                <p className="mt-1 text-sm font-bold text-gray-950">{formatShortDate(selectedCustomer.firstOrderAt)}</p>
              </div>
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                <p className="text-xs text-gray-500">Sem compra</p>
                <p className="mt-1 text-xl font-bold text-gray-950">{selectedCustomer.daysSinceLastOrder ?? 0}d</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.1fr]">
              <div className="space-y-4">
                <div className="rounded-lg border border-emerald-100 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Tag size={18} className="text-emerald-700" />
                    <h4 className="font-semibold text-gray-950">Etiquetas</h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedCustomer.tags || []).map((tag) => (
                      <AdminBadge key={tag} tone={tagTone(tag)}>{tag}</AdminBadge>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-emerald-100 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles size={18} className="text-emerald-700" />
                    <h4 className="font-semibold text-gray-950">Preferências</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Produto favorito</p>
                      <p className="font-semibold text-gray-950">{selectedCustomer.favoriteProduct?.name || '-'}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Categoria</p>
                      <p className="font-semibold text-gray-950">{selectedCustomer.favoriteCategory || '-'}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Sabor</p>
                      <p className="font-semibold text-gray-950">{selectedCustomer.favoriteFlavor || '-'}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Adicional</p>
                      <p className="font-semibold text-gray-950">{selectedCustomer.favoriteAddon || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-emerald-100 p-4">
                  <h4 className="font-semibold text-gray-950">Endereço mais recente</h4>
                  <p className="mt-2 text-sm text-gray-600">
                    {selectedCustomer.street
                      ? `${selectedCustomer.street}, ${selectedCustomer.number} - ${selectedCustomer.neighborhood}, ${selectedCustomer.city}`
                      : 'Cliente retirou no local no último pedido.'}
                  </p>
                  {selectedCustomer.cep && <p className="mt-1 text-xs text-gray-500">CEP {selectedCustomer.cep}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-emerald-100 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <MessageCircle size={18} className="text-emerald-700" />
                    <h4 className="font-semibold text-gray-950">Ações de WhatsApp</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {[
                      ['thanks', 'Agradecer compra', HeartHandshake],
                      ['review', 'Pedir avaliação', Star],
                      ['favorite', 'Oferecer favorito', ShoppingBag],
                      ['inactive', 'Chamar inativo', Repeat],
                      ['returnCoupon', 'Cupom retorno', Gift],
                      ['vipCoupon', 'Cupom VIP', Sparkles],
                    ].map(([id, label, Icon]) => {
                      const ActionIcon = Icon as typeof MessageCircle;
                      return (
                        <button
                          key={id as string}
                          type="button"
                          onClick={() => openWhatsapp(selectedCustomer, id as string)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-100 bg-white px-3 py-2 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-50"
                        >
                          <ActionIcon size={16} />
                          {label as string}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-gray-500">As mensagens abrem no WhatsApp com texto editável antes do envio.</p>
                </div>

                <div className="rounded-lg border border-emerald-100 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-700" />
                    <h4 className="font-semibold text-gray-950">Top produtos do cliente</h4>
                  </div>
                  <div className="space-y-2">
                    {(selectedCustomer.topProducts || []).length === 0 ? (
                      <p className="text-sm text-gray-500">Sem produtos suficientes para ranking.</p>
                    ) : (
                      selectedCustomer.topProducts?.map((product) => (
                        <div key={product.name} className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-3 text-sm">
                          <div>
                            <p className="font-semibold text-gray-950">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.quantity} unidades compradas</p>
                          </div>
                          <span className="font-semibold text-emerald-800">{formatCurrency(product.total)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-950">
                <ShoppingBag size={18} className="text-emerald-700" /> Histórico de pedidos
              </h4>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {selectedOrders.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-emerald-100 p-4 text-sm text-gray-500">Nenhum pedido encontrado para este telefone.</p>
                ) : (
                  selectedOrders.map((order) => (
                    <div key={order.id} className="rounded-lg border border-gray-100 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-950">#{order.id.slice(-6)} • {formatCurrency(order.total)}</p>
                          <p className="text-xs text-gray-500">{formatDate(order.createdAt)} • {getDeliveryMethodLabel(order.deliveryMethod)} • {getStatusLabel(order.status)}</p>
                        </div>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        {order.items.map((item) => (
                          <p key={item.id}>{item.quantity}x {item.productName}</p>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
