'use client'

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { DollarSign, ShoppingBag, Users, Eye } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashboardOverview({ metrics }: { metrics: any }) {
  if (!metrics) return <div className="p-4">Carregando métricas...</div>;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-500 font-medium">Faturamento Total</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">R$ {metrics.revenue.total.toFixed(2)}</h3>
                    <p className="text-xs text-gray-400 mt-1">Mês atual: R$ {metrics.revenue.monthly.toFixed(2)}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    <DollarSign size={20} />
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-500 font-medium">Total de Pedidos</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{metrics.orders}</h3>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <ShoppingBag size={20} />
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-500 font-medium">Visitantes</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{metrics.visits}</h3>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    <Users size={20} />
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-500 font-medium">Visualizações (Produtos)</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {metrics.topProducts.reduce((acc: number, curr: any) => acc + curr.views, 0)}
                    </h3>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <Eye size={20} />
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Faturamento Diário Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Faturamento (Últimos 7 dias)</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.dailyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={(val) => new Date(val).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} 
                            fontSize={12}
                        />
                        <YAxis fontSize={12} tickFormatter={(val) => `R$${val}`} />
                        <Tooltip 
                            formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Faturamento']}
                            labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR')}
                        />
                        <Bar dataKey="total" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Origem do Tráfego Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Origem do Tráfego</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={metrics.trafficSources}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {metrics.trafficSources.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Produtos Mais Acessados</h3>
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
                      <tr>
                          <th className="px-4 py-3">Produto</th>
                          <th className="px-4 py-3 text-right">Visualizações</th>
                          <th className="px-4 py-3">Popularidade</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {metrics.topProducts.map((product: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                              <td className="px-4 py-3 text-right">{product.views}</td>
                              <td className="px-4 py-3">
                                  <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                                      <div 
                                          className="bg-blue-600 h-2 rounded-full" 
                                          style={{ width: `${Math.min(100, (product.views / Math.max(...metrics.topProducts.map((p: any) => p.views), 1)) * 100)}%` }}
                                      ></div>
                                  </div>
                              </td>
                          </tr>
                      ))}
                      {metrics.topProducts.length === 0 && (
                          <tr>
                              <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                                  Nenhum dado disponível ainda.
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
}
