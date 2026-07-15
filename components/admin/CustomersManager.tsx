'use client';

import { BadgeDollarSign, Copy, Download, MessageCircle, Repeat, Search, ShieldCheck, ShoppingBag, Star, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AdminEmptyState, AdminPageHeader, AdminSection, AdminStatCard } from './AdminPrimitives';
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
  lastOrderAt: Date | string;
  totalSpent: number;
}

const customerCurrencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function CustomersManager({
  initialCustomers,
  initialOrders,
}: {
  initialCustomers: Customer[];
  initialOrders: Order[];
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const customers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return initialCustomers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(term) ||
        customer.phone.includes(searchTerm.replace(/\D/g, '')) ||
        customer.neighborhood.toLowerCase().includes(term)
      );
    });
  }, [initialCustomers, searchTerm]);

  const recurringCustomers = initialCustomers.filter((customer) => customer.ordersCount > 1).length;
  const totalRevenue = initialCustomers.reduce((total, customer) => total + customer.totalSpent, 0);
  const averageTicket = initialCustomers.length > 0 ? totalRevenue / initialCustomers.length : 0;
  const bestCustomer = initialCustomers.slice().sort((a, b) => b.totalSpent - a.totalSpent)[0];
  const selectedOrders = selectedCustomer
    ? initialOrders.filter((order) => order.customerPhone === selectedCustomer.phone)
    : [];

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

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const localDigits = digits.startsWith('55') ? digits.slice(2) : digits;
    if (localDigits.length <= 2) return localDigits;
    if (localDigits.length <= 7) return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2)}`;
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 7)}-${localDigits.slice(7, 11)}`;
  };

  const getWhatsappNumber = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
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

  const exportCustomers = () => {
    const headers = ['Nome', 'Telefone', 'CEP', 'Endereco', 'Bairro', 'Cidade', 'Tipo', 'Pedidos', 'Ultimo pedido', 'Total comprado'];
    const rows = customers.map((customer) => [
      customer.name,
      formatPhone(customer.phone),
      customer.cep,
      customer.street ? `${customer.street}, ${customer.number}` : 'Retirada no local',
      customer.neighborhood,
      customer.city,
      getDeliveryMethodLabel(customer.deliveryMethod),
      String(customer.ordersCount),
      formatDate(customer.lastOrderAt),
      formatCurrency(customer.totalSpent),
    ]);

    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clientes-nisi-${new Date().toISOString().slice(0, 10)}.csv`;
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
        eyebrow="Relacionamento"
        title="Clientes"
        description="Veja quem compra, quanto compra e quem voltou mais de uma vez."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <AdminStatCard label="Clientes" value={initialCustomers.length} detail="contatos unicos por telefone" icon={Users} />
        <AdminStatCard label="Recorrentes" value={recurringCustomers} detail="mais de um pedido" icon={Repeat} />
        <AdminStatCard label="Ticket médio" value={formatCurrency(averageTicket)} detail="por cliente" icon={BadgeDollarSign} />
        <AdminStatCard label="Maior cliente" value={formatCurrency(bestCustomer?.totalSpent || 0)} detail={bestCustomer?.name || 'Sem pedidos'} icon={Star} />
      </div>

      <div className="flex gap-3 rounded-lg border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-gray-700">
        <ShieldCheck className="mt-0.5 shrink-0 text-emerald-700" size={18} />
        <p>
          Os dados desta base vêm dos pedidos do checkout e devem ser usados apenas para atendimento, relacionamento e campanhas do NISI.
        </p>
      </div>

      <AdminSection
        title="Base de clientes"
        description="Dados agregados automaticamente pelos pedidos do checkout."
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative w-full sm:w-80">
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
        {customers.length === 0 ? (
          <AdminEmptyState icon={Users} title="Nenhum cliente encontrado" description="Os clientes aparecem aqui depois dos pedidos concluidos no checkout." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left">
              <thead>
                <tr className="border-b bg-emerald-50/60 text-sm text-emerald-950">
                  <th className="p-3 font-semibold">Cliente</th>
                  <th className="p-3 font-semibold">Contato</th>
                  <th className="p-3 font-semibold">Endereço</th>
                  <th className="p-3 font-semibold">Pedidos</th>
                  <th className="p-3 font-semibold">Último pedido</th>
                  <th className="p-3 font-semibold text-right">Comprou</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.phone} className="border-b text-sm hover:bg-gray-50">
                    <td className="p-3">
                      <button type="button" onClick={() => setSelectedCustomer(customer)} className="text-left">
                        <div className="font-semibold text-gray-950 hover:text-emerald-800">{customer.name}</div>
                        <div className="text-xs text-gray-500">
                          {getDeliveryMethodLabel(customer.deliveryMethod)}
                        </div>
                      </button>
                    </td>
                    <td className="p-3 text-gray-700">
                      <div className="flex items-center gap-2">
                        <span>{formatPhone(customer.phone)}</span>
                        <button type="button" onClick={() => copyPhone(customer.phone)} className="rounded p-1 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700" title={`Copiar telefone de ${customer.name}`} aria-label={`Copiar telefone de ${customer.name}`}>
                          <Copy size={15} />
                        </button>
                        <a href={`https://wa.me/${getWhatsappNumber(customer.phone)}`} target="_blank" rel="noopener noreferrer" className="rounded p-1 text-emerald-700 hover:bg-emerald-50" title={`Abrir WhatsApp de ${customer.name}`} aria-label={`Abrir WhatsApp de ${customer.name}`}>
                          <MessageCircle size={16} />
                        </a>
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">
                      {customer.street ? `${customer.street}, ${customer.number}` : 'Retirada no local'}
                      {customer.neighborhood && (
                        <div className="text-xs text-gray-500">
                          {customer.neighborhood}, {customer.city}
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-emerald-800">{customer.ordersCount}</td>
                    <td className="p-3 text-gray-600">{formatDate(customer.lastOrderAt)}</td>
                    <td className="p-3 text-right font-semibold text-gray-950">{formatCurrency(customer.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminSection>

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30 p-0 sm:items-center sm:justify-center sm:p-4" role="dialog" aria-modal="true">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-lg bg-white p-5 shadow-xl sm:max-w-3xl sm:rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Detalhe do cliente</p>
                <h3 className="mt-1 text-xl font-bold text-gray-950">{selectedCustomer.name}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  <span>{formatPhone(selectedCustomer.phone)}</span>
                  <a href={`https://wa.me/${getWhatsappNumber(selectedCustomer.phone)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800">
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedCustomer(null)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" title="Fechar detalhes" aria-label="Fechar detalhes">
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                <p className="text-xs text-gray-500">Pedidos</p>
                <p className="mt-1 text-xl font-bold text-gray-950">{selectedCustomer.ordersCount}</p>
              </div>
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                <p className="text-xs text-gray-500">Total gasto</p>
                <p className="mt-1 text-xl font-bold text-gray-950">{formatCurrency(selectedCustomer.totalSpent)}</p>
              </div>
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                <p className="text-xs text-gray-500">Último pedido</p>
                <p className="mt-1 text-sm font-bold text-gray-950">{formatDate(selectedCustomer.lastOrderAt)}</p>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-emerald-100 p-4">
              <h4 className="font-semibold text-gray-950">Endereço mais recente</h4>
              <p className="mt-2 text-sm text-gray-600">
                {selectedCustomer.street
                  ? `${selectedCustomer.street}, ${selectedCustomer.number} - ${selectedCustomer.neighborhood}, ${selectedCustomer.city}`
                  : 'Cliente retirou no local no último pedido.'}
              </p>
              {selectedCustomer.cep && <p className="mt-1 text-xs text-gray-500">CEP {selectedCustomer.cep}</p>}
            </div>

            <div className="mt-5">
              <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-950">
                <ShoppingBag size={18} className="text-emerald-700" /> Histórico de pedidos
              </h4>
              <div className="space-y-3">
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
