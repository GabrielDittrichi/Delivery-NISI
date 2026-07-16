'use client'

import { useMemo, useState } from 'react';
import { DataStore } from '@/lib/db';
import RestaurantForm from './RestaurantForm';
import CategoryManager from './CategoryManager';
import ProductManager from './ProductManager';
import CouponManager from './CouponManager';
import CustomersManager, { Customer } from './CustomersManager';
import DashboardOverview from './DashboardOverview';
import OrdersManager from './OrdersManager';
import type { DashboardMetrics } from './DashboardOverview';
import type { Order } from './OrdersManager';
import {
  BadgePercent,
  BarChart3,
  ClipboardList,
  ListTree,
  Package,
  Settings,
  ShoppingBag,
  Users,
} from 'lucide-react';

type AdminTab = 'overview' | 'orders' | 'customers' | 'products' | 'categories' | 'coupons' | 'restaurant';

const tabs: {
  id: AdminTab;
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof BarChart3;
}[] = [
  { id: 'overview', label: 'Visão Geral', shortLabel: 'Geral', description: 'Indicadores e alertas do dia', icon: BarChart3 },
  { id: 'orders', label: 'Pedidos', shortLabel: 'Pedidos', description: 'Acompanhe o atendimento', icon: ClipboardList },
  { id: 'customers', label: 'Clientes', shortLabel: 'Clientes', description: 'Histórico e recorrência', icon: Users },
  { id: 'products', label: 'Produtos', shortLabel: 'Produtos', description: 'Cardápio e disponibilidade', icon: ShoppingBag },
  { id: 'categories', label: 'Categorias', shortLabel: 'Categorias', description: 'Organização do cardápio', icon: ListTree },
  { id: 'coupons', label: 'Cupons', shortLabel: 'Cupons', description: 'Promoções e regras', icon: BadgePercent },
  { id: 'restaurant', label: 'Configurações', shortLabel: 'Config.', description: 'Dados do restaurante', icon: Settings },
];

export default function AdminDashboard({
  initialData,
  initialMetrics,
  initialOrders,
  initialCustomers,
}: {
  initialData: DataStore;
  initialMetrics?: DashboardMetrics | null;
  initialOrders?: Order[];
  initialCustomers?: Customer[];
}) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  const pendingOrders = useMemo(
    () => (initialOrders || []).filter((order) => order.status === 'PENDING').length,
    [initialOrders]
  );

  const activeProducts = useMemo(
    () => initialData.products.filter((product) => product.isActive !== false).length,
    [initialData.products]
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview metrics={initialMetrics} products={initialData.products} orders={initialOrders || []} customers={initialCustomers || []} onNavigate={setActiveTab} />;
      case 'orders':
        return <OrdersManager initialOrders={initialOrders || []} />;
      case 'customers':
        return <CustomersManager initialCustomers={initialCustomers || []} initialOrders={initialOrders || []} />;
      case 'products':
        return <ProductManager categories={initialData.categories} products={initialData.products} />;
      case 'categories':
        return <CategoryManager categories={initialData.categories} products={initialData.products} />;
      case 'coupons':
        return <CouponManager />;
      case 'restaurant':
        return <RestaurantForm restaurant={initialData.restaurant} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f6faf7]">
      <div className="mx-auto flex max-w-[1440px] flex-col lg:flex-row">
        <aside className="sticky top-0 z-30 border-b border-emerald-100 bg-white/95 px-4 py-4 shadow-sm backdrop-blur lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:px-5">
          <div className="mb-5 hidden lg:block">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-700 text-white">
              <Package size={21} />
            </div>
            <h1 className="mt-3 text-lg font-bold text-gray-950">NISI Admin</h1>
            <p className="mt-1 text-sm leading-5 text-gray-500">Operação do cardápio digital.</p>
            <a href="/" target="_blank" className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100">
              <ShoppingBag size={16} />
              Ver cardápio
            </a>
          </div>

          <nav className="grid grid-cols-4 gap-2 overflow-x-auto pb-1 sm:grid-cols-7 lg:flex lg:flex-col lg:overflow-visible lg:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-w-[76px] flex-col items-center gap-1 rounded-lg border px-2 py-2 text-xs font-semibold transition-colors lg:min-w-0 lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:py-3 lg:text-sm ${
                    isActive
                      ? 'border-emerald-700 bg-emerald-700 text-white shadow-sm'
                      : 'border-emerald-100 bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-800'
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="lg:hidden">{tab.shortLabel}</span>
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <header className="mb-6 rounded-lg border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Espaço Vida Saudável NISI</p>
                <h2 className="mt-1 text-2xl font-bold text-gray-950">{currentTab.label}</h2>
                <p className="mt-1 text-sm text-gray-600">{currentTab.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-lg bg-emerald-50 px-3 py-2">
                  <p className="text-xs font-medium text-emerald-700">Pendentes</p>
                  <p className="font-bold text-gray-950">{pendingOrders}</p>
                </div>
                <div className="rounded-lg bg-emerald-50 px-3 py-2">
                  <p className="text-xs font-medium text-emerald-700">Produtos</p>
                  <p className="font-bold text-gray-950">{activeProducts}</p>
                </div>
                <div className="rounded-lg bg-emerald-50 px-3 py-2">
                  <p className="text-xs font-medium text-emerald-700">Clientes</p>
                  <p className="font-bold text-gray-950">{initialCustomers?.length || 0}</p>
                </div>
              </div>
            </div>
          </header>

          {renderContent()}
        </main>
      </div>
    </div>
  );
}
