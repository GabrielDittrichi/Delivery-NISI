'use client';

import { Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

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

export default function CustomersManager({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const customers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return initialCustomers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(term) ||
        customer.phone.includes(searchTerm) ||
        customer.neighborhood.toLowerCase().includes(term)
      );
    });
  }, [initialCustomers, searchTerm]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <Users className="text-emerald-700" />
            Clientes
          </h2>
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou bairro..."
              className="w-full rounded-lg border py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-600"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        {customers.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center text-gray-500">
            Nenhum cliente encontrado ainda. Os clientes aparecem aqui depois dos pedidos concluídos no checkout.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b bg-emerald-50/60 text-sm text-emerald-950">
                  <th className="p-3 font-semibold">Cliente</th>
                  <th className="p-3 font-semibold">Contato</th>
                  <th className="p-3 font-semibold">Endereco</th>
                  <th className="p-3 font-semibold">Pedidos</th>
                  <th className="p-3 font-semibold">Ultimo pedido</th>
                  <th className="p-3 font-semibold text-right">Comprou</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.phone} className="border-b text-sm hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-semibold text-gray-950">{customer.name}</div>
                      <div className="text-xs text-gray-500">
                        {customer.deliveryMethod === 'PICKUP' ? 'Retirada' : 'Entrega'}
                      </div>
                    </td>
                    <td className="p-3 text-gray-700">{customer.phone}</td>
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
      </div>
    </div>
  );
}
