'use client'
import { useState } from 'react';
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
import { LayoutDashboard, ShoppingBag, List, Tag, PieChart, Package, Users } from 'lucide-react';

export default function AdminDashboard({ initialData, initialMetrics, initialOrders, initialCustomers }: { initialData: DataStore, initialMetrics?: DashboardMetrics | null, initialOrders?: Order[], initialCustomers?: Customer[] }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'customers' | 'restaurant' | 'categories' | 'products' | 'coupons'>('overview');

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1 grid grid-cols-2 gap-2 md:flex md:flex-col md:space-y-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`w-full flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'overview' ? 'bg-emerald-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          <PieChart size={20} className="shrink-0" />
          <span className="hidden sm:inline">Visão Geral</span>
          <span className="sm:hidden">Geral</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`w-full flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'orders' ? 'bg-emerald-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          <Package size={20} className="shrink-0" />
          <span className="hidden sm:inline">Pedidos</span>
          <span className="sm:hidden">Pedidos</span>
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`w-full flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'customers' ? 'bg-emerald-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          <Users size={20} className="shrink-0" />
          <span className="hidden sm:inline">Clientes</span>
          <span className="sm:hidden">Clientes</span>
        </button>
        <button
          onClick={() => setActiveTab('restaurant')}
          className={`w-full flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'restaurant' ? 'bg-emerald-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          <LayoutDashboard size={20} className="shrink-0" />
          <span className="hidden sm:inline">Restaurante</span>
          <span className="sm:hidden">Rest.</span>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`w-full flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'categories' ? 'bg-emerald-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          <List size={20} className="shrink-0" />
          <span className="hidden sm:inline">Categorias</span>
          <span className="sm:hidden">Cat.</span>
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`w-full flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'products' ? 'bg-emerald-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          <ShoppingBag size={20} className="shrink-0" />
          <span className="hidden sm:inline">Produtos</span>
          <span className="sm:hidden">Prod.</span>
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`w-full flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'coupons' ? 'bg-emerald-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          <Tag size={20} className="shrink-0" />
          <span className="hidden sm:inline">Cupons</span>
          <span className="sm:hidden">Cupons</span>
        </button>
      </div>

      <div className="md:col-span-3">
        {activeTab === 'overview' && <DashboardOverview metrics={initialMetrics} />}
        {activeTab === 'orders' && <OrdersManager initialOrders={initialOrders || []} />}
        {activeTab === 'customers' && <CustomersManager initialCustomers={initialCustomers || []} />}
        {activeTab === 'restaurant' && <RestaurantForm restaurant={initialData.restaurant} />}
        {activeTab === 'categories' && <CategoryManager categories={initialData.categories} />}
        {activeTab === 'products' && <ProductManager categories={initialData.categories} products={initialData.products} />}
        {activeTab === 'coupons' && <CouponManager />}
      </div>
    </div>
  );
}
