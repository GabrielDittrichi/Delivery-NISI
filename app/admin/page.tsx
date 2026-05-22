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
    <AdminDashboard initialData={data} initialMetrics={metrics} initialOrders={orders} initialCustomers={customers} />
  );
}
