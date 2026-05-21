import { getData } from '@/lib/db';
import { getDashboardMetrics } from '@/lib/analytics';
import { getCustomers, getOrders } from '@/lib/actions';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const data = await getData();
  const metrics = await getDashboardMetrics();
  const orders = await getOrders();
  const customers = await getCustomers();
  
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm px-6 py-4 mb-6">
        <h1 className="text-xl font-bold text-gray-800">Painel Administrativo - Espaco Vida Saudavel NISI</h1>
      </nav>
      <div className="container mx-auto px-4 pb-20 max-w-6xl">
        <AdminDashboard initialData={data} initialMetrics={metrics} initialOrders={orders} initialCustomers={customers} />
      </div>
    </div>
  );
}
