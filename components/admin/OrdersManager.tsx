'use client'

import { useState } from 'react';
import { updateOrderStatus } from '@/lib/actions';
import { ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, Truck, Package, Search } from 'lucide-react';
import clsx from 'clsx';

// Define types based on Prisma schema since we don't have direct access to generated types in client component easily without importing from @prisma/client
interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  selectedFlavor?: string | null;
  selectedAddons?: string | null;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  status: string;
  total: number;
  createdAt: Date;
  items: OrderItem[];
  paymentMethod: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  complement?: string | null;
  observations?: string | null;
}

export default function OrdersManager({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Erro ao atualizar status');
    } finally {
      setUpdating(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Package className="text-red-600" />
          Gerenciar Pedidos
        </h2>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou ID..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {['ALL', 'PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={clsx(
                  "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  filterStatus === status 
                    ? "bg-gray-900 text-white" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {status === 'ALL' ? 'Todos' : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhum pedido encontrado.
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="border rounded-lg overflow-hidden transition-all hover:shadow-md">
                <div 
                  className="p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                  onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={clsx("p-2 rounded-full", order.status === 'PENDING' ? "bg-yellow-50" : "bg-gray-50")}>
                      {order.status === 'PENDING' && <Clock className="text-yellow-600" size={24} />}
                      {order.status === 'CONFIRMED' && <CheckCircle className="text-blue-600" size={24} />}
                      {order.status === 'DELIVERED' && <Truck className="text-green-600" size={24} />}
                      {order.status === 'CANCELED' && <XCircle className="text-red-600" size={24} />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">#{order.id.slice(-6)} - {order.customerName}</h3>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)} • {formatCurrency(order.total)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 justify-between md:justify-end">
                    <span className={clsx("px-3 py-1 rounded-full text-xs font-bold border", getStatusColor(order.status))}>
                      {getStatusLabel(order.status)}
                    </span>
                    {expandedOrderId === order.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                  </div>
                </div>

                {expandedOrderId === order.id && (
                  <div className="bg-gray-50 p-4 border-t animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Itens do Pedido</h4>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="bg-white p-3 rounded border text-sm">
                              <div className="flex justify-between font-medium">
                                <span>{item.quantity}x {item.productName}</span>
                                <span>{formatCurrency(item.total)}</span>
                              </div>
                              {item.selectedFlavor && <p className="text-gray-500 text-xs mt-1">Sabor: {item.selectedFlavor}</p>}
                              {item.selectedAddons && (
                                <p className="text-gray-500 text-xs mt-1">
                                  Adicionais: {JSON.parse(item.selectedAddons).join(', ')}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between font-bold text-gray-900">
                          <span>Total</span>
                          <span>{formatCurrency(order.total)}</span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Detalhes da Entrega</h4>
                          <div className="bg-white p-3 rounded border text-sm space-y-1">
                            <p><span className="font-medium">Cliente:</span> {order.customerName}</p>
                            <p><span className="font-medium">Telefone:</span> {order.customerPhone}</p>
                            <p><span className="font-medium">Endereço:</span> {order.street}, {order.number}</p>
                            <p>{order.neighborhood}, {order.city}</p>
                            {order.complement && <p><span className="font-medium">Complemento:</span> {order.complement}</p>}
                            <p><span className="font-medium">Pagamento:</span> {order.paymentMethod === 'MONEY' ? 'Dinheiro' : order.paymentMethod === 'CREDIT' ? 'Cartão de Crédito' : order.paymentMethod === 'DEBIT' ? 'Cartão de Débito' : 'PIX'}</p>
                            {order.observations && (
                              <div className="mt-2 pt-2 border-t">
                                <span className="font-medium text-red-600">Observações:</span>
                                <p className="text-gray-600">{order.observations}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Ações</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {order.status === 'PENDING' && (
                              <>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, 'CONFIRMED'); }}
                                  disabled={updating === order.id}
                                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                  Confirmar Pedido
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, 'CANCELED'); }}
                                  disabled={updating === order.id}
                                  className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
                                >
                                  Cancelar
                                </button>
                              </>
                            )}
                            {order.status === 'CONFIRMED' && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, 'DELIVERED'); }}
                                disabled={updating === order.id}
                                className="col-span-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
                              >
                                Marcar como Entregue
                              </button>
                            )}
                            {order.status === 'DELIVERED' && (
                               <p className="col-span-2 text-center text-green-600 font-medium py-2">Pedido Finalizado</p>
                            )}
                            {order.status === 'CANCELED' && (
                               <p className="col-span-2 text-center text-red-600 font-medium py-2">Pedido Cancelado</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
