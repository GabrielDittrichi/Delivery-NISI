'use client'

import {
  AlertCircle,
  BadgePercent,
  CalendarClock,
  DollarSign,
  MousePointerClick,
  PackageOpen,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { Product } from '@/lib/db';
import { AdminBadge, AdminPageHeader, AdminSection, AdminStatCard } from './AdminPrimitives';
import type { Order } from './OrdersManager';
import type { Customer } from './CustomersManager';

const COLORS = ['#16803C', '#0F5130', '#86EFAC', '#A7F3D0', '#D1FAE5'];
const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function ChartEmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-emerald-100 bg-emerald-50/40 px-6 text-center">
      <p className="text-sm font-medium text-gray-500">{label}</p>
    </div>
  );
}

export type DashboardMetrics = {
  revenue: { total: number; monthly: number };
  orders: number;
  visits: number;
  topProducts: { name: string; views: number }[];
  trafficSources: { name: string; value: number }[];
  dailyRevenue: { date: string; total: number }[];
  funnel: {
    addToCart: number;
    checkoutStarted: number;
    orderCreated: number;
    checkoutConversion: number;
    cartConversion: number;
  };
};

export default function DashboardOverview({
  metrics,
  products,
  orders,
  customers,
  onNavigate,
}: {
  metrics: DashboardMetrics | null | undefined;
  products: Product[];
  orders: Order[];
  customers: Customer[];
  onNavigate: (tab: 'orders' | 'products' | 'coupons' | 'restaurant') => void;
}) {
  if (!metrics) return <div className="p-4">Carregando métricas...</div>;

  const today = new Date().toDateString();
  const todayOrders = orders.filter((order) => new Date(order.createdAt).toDateString() === today);
  const todayRevenue = todayOrders
    .filter((order) => order.status !== 'CANCELED')
    .reduce((total, order) => total + order.total, 0);
  const pendingOrders = orders.filter((order) => order.status === 'PENDING').length;
  const activeProducts = products.filter((product) => product.isActive !== false).length;
  const recurringCustomers = customers.filter((customer) => customer.ordersCount > 1).length;
  const productsWithoutImage = products.filter((product) => !product.imageUrl).length;
  const inactiveProducts = products.filter((product) => product.isActive === false).length;
  const hasDailyRevenue = metrics.dailyRevenue.some((day) => day.total > 0);
  const hasTrafficSources = metrics.trafficSources.some((source) => source.value > 0);
  const maxDailyRevenue = Math.max(...metrics.dailyRevenue.map((day) => day.total), 1);
  const totalTrafficSources = metrics.trafficSources.reduce((total, source) => total + source.value, 0);

  const formatCurrency = (value: number) => currencyFormatter.format(value);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Painel"
        title="Resumo da operação"
        description="Acompanhe pedidos, receita, clientes e pontos que precisam de atenção antes do atendimento ficar corrido."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Pedidos hoje" value={todayOrders.length} detail={`${pendingOrders} pendentes`} icon={ShoppingBag} />
        <AdminStatCard label="Receita hoje" value={formatCurrency(todayRevenue)} detail={`Mes: ${formatCurrency(metrics.revenue.monthly)}`} icon={DollarSign} />
        <AdminStatCard label="Produtos ativos" value={activeProducts} detail={`${products.length} cadastrados`} icon={PackageOpen} />
        <AdminStatCard label="Clientes recorrentes" value={recurringCustomers} detail={`${customers.length} clientes`} icon={Users} />
      </div>

      <AdminSection title="Ações rápidas" description="Atalhos para as rotinas que mais movimentam o cardápio.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <button onClick={() => onNavigate('orders')} className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-left transition-colors hover:bg-emerald-100">
            <CalendarClock className="mb-3 text-emerald-700" size={20} />
            <p className="font-semibold text-gray-950">Ver pedidos</p>
            <p className="mt-1 text-sm text-gray-600">Priorize os pendentes.</p>
          </button>
          <button onClick={() => onNavigate('products')} className="rounded-lg border border-emerald-100 bg-white p-4 text-left transition-colors hover:bg-emerald-50">
            <ShoppingBag className="mb-3 text-emerald-700" size={20} />
            <p className="font-semibold text-gray-950">Novo produto</p>
            <p className="mt-1 text-sm text-gray-600">Ajuste cardapio e destaques.</p>
          </button>
          <button onClick={() => onNavigate('coupons')} className="rounded-lg border border-emerald-100 bg-white p-4 text-left transition-colors hover:bg-emerald-50">
            <BadgePercent className="mb-3 text-emerald-700" size={20} />
            <p className="font-semibold text-gray-950">Criar cupom</p>
            <p className="mt-1 text-sm text-gray-600">Configure regras de uso.</p>
          </button>
          <button onClick={() => onNavigate('restaurant')} className="rounded-lg border border-emerald-100 bg-white p-4 text-left transition-colors hover:bg-emerald-50">
            <AlertCircle className="mb-3 text-emerald-700" size={20} />
            <p className="font-semibold text-gray-950">Editar horarios</p>
            <p className="mt-1 text-sm text-gray-600">Atualize o atendimento.</p>
          </button>
        </div>
      </AdminSection>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AdminSection title="Faturamento dos últimos 7 dias">
          {hasDailyRevenue ? (
            <div className="flex h-72 items-end gap-3 rounded-lg border border-emerald-100 bg-white p-4">
              {metrics.dailyRevenue.map((day) => {
                const height = Math.max(8, (day.total / maxDailyRevenue) * 100);
                return (
                  <div key={day.date} className="flex h-full flex-1 flex-col justify-end gap-2">
                    <div className="flex flex-1 items-end">
                      <div
                        className="w-full rounded-t bg-emerald-700"
                        style={{ height: `${height}%` }}
                        title={`${new Date(day.date).toLocaleDateString('pt-BR')}: ${formatCurrency(day.total)}`}
                      />
                    </div>
                    <span className="text-center text-[11px] font-medium text-gray-500">
                      {new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <ChartEmptyState label="O faturamento aparece aqui depois dos primeiros pedidos pagos." />
          )}
        </AdminSection>

        <AdminSection title="Origem dos acessos">
          {hasTrafficSources ? (
            <div className="flex h-72 flex-col justify-center gap-4 rounded-lg border border-emerald-100 bg-white p-4">
              {metrics.trafficSources.map((source, index) => {
                const percentage = totalTrafficSources > 0 ? (source.value / totalTrafficSources) * 100 : 0;
                return (
                  <div key={source.name}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-sm font-semibold text-gray-700">{source.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: COLORS[index % COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <ChartEmptyState label="As origens de acesso serão exibidas quando houver visitas rastreadas." />
          )}
        </AdminSection>
      </div>

      <AdminSection title="Funil de conversão" description="Leitura rápida do caminho até o pedido.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-4">
            <MousePointerClick className="mb-2 text-emerald-700" size={18} />
            <p className="text-sm text-gray-500">Carrinho</p>
            <p className="mt-1 text-2xl font-bold text-gray-950">{metrics.funnel.addToCart}</p>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-4">
            <p className="text-sm text-gray-500">Checkout</p>
            <p className="mt-1 text-2xl font-bold text-gray-950">{metrics.funnel.checkoutStarted}</p>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-4">
            <p className="text-sm text-gray-500">Pedidos</p>
            <p className="mt-1 text-2xl font-bold text-gray-950">{metrics.funnel.orderCreated}</p>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-4">
            <p className="text-sm text-gray-500">Taxa de conversão</p>
            <p className="mt-1 text-2xl font-bold text-gray-950">{(metrics.funnel.checkoutConversion * 100).toFixed(0)}%</p>
          </div>
        </div>
      </AdminSection>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AdminSection title="Produtos mais acessados">
          <div className="space-y-3">
            {metrics.topProducts.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">Nenhum dado disponivel ainda.</p>
            ) : (
              metrics.topProducts.map((product) => {
                const maxViews = Math.max(...metrics.topProducts.map((item) => item.views), 1);
                return (
                  <div key={product.name} className="rounded-lg border border-gray-100 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-gray-950">{product.name}</p>
                      <AdminBadge>{product.views} views</AdminBadge>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-emerald-700" style={{ width: `${Math.min(100, (product.views / maxViews) * 100)}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </AdminSection>

        <AdminSection title="Alertas operacionais" description="Itens que merecem revisão antes de divulgar o cardápio.">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
              <span className="text-sm font-medium text-gray-700">Pedidos pendentes</span>
              <AdminBadge tone={pendingOrders > 0 ? 'amber' : 'green'}>{pendingOrders}</AdminBadge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-white p-3">
              <span className="text-sm font-medium text-gray-700">Produtos sem foto</span>
              <AdminBadge tone={productsWithoutImage > 0 ? 'amber' : 'green'}>{productsWithoutImage}</AdminBadge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-white p-3">
              <span className="text-sm font-medium text-gray-700">Produtos inativos</span>
              <AdminBadge tone={inactiveProducts > 0 ? 'gray' : 'green'}>{inactiveProducts}</AdminBadge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-white p-3">
              <span className="text-sm font-medium text-gray-700">Visitantes registrados</span>
              <AdminBadge>{metrics.visits}</AdminBadge>
            </div>
          </div>
        </AdminSection>
      </div>
    </div>
  );
}
