import { getData, getFallbackData } from '@/lib/db';
import { getDashboardMetrics } from '@/lib/analytics';
import { getCustomers, getOrders } from '@/lib/actions';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const dynamic = 'force-dynamic';

const emptyMetrics = {
  revenue: { total: 0, monthly: 0 },
  orders: 0,
  visits: 0,
  topProducts: [],
  trafficSources: [],
  dailyRevenue: [],
  funnel: {
    addToCart: 0,
    checkoutStarted: 0,
    orderCreated: 0,
    checkoutConversion: 0,
    cartConversion: 0,
  },
};

async function withAdminFallback<T>(promise: Promise<T>, fallback: T, label: string) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timeout = setTimeout(() => {
          console.info(`Admin data timeout: ${label}`);
          resolve(fallback);
        }, 8000);
      }),
    ]);
  } catch {
    console.info(`Admin data error: ${label}`);
    return fallback;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export default async function AdminPage() {
  const [data, metrics, orders, customers] = await Promise.all([
    withAdminFallback(getData(), getFallbackData(), 'store'),
    withAdminFallback(getDashboardMetrics(), emptyMetrics, 'metrics'),
    withAdminFallback(getOrders(), [], 'orders'),
    withAdminFallback(getCustomers(), [], 'customers'),
  ]);
  
  return (
    <AdminDashboard initialData={data} initialMetrics={metrics} initialOrders={orders} initialCustomers={customers} />
  );
}
