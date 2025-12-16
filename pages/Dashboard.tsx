
import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { useNotifications } from '../context/NotificationContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Order, Customer, Conversation } from '../types';
import { apiService } from '../services/apiService';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  unreadMessages: number;
}

interface RevenueData {
  name: string;
  revenue: number;
}

export const Dashboard: React.FC = () => {
  const { showNotification } = useNotifications();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const orders: Order[] = await apiService.getOrders();
        const customers: Customer[] = await apiService.getCustomers();
        // Fix: Use getConversations to fetch unread messages
        const conversations: Conversation[] = await apiService.getConversations();

        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order => order.status === 'Pending').length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const totalCustomers = customers.length;
        // Fix: Calculate unread messages by summing unreadCount from conversations
        const unreadMessages = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

        setStats({
          totalOrders,
          pendingOrders,
          totalRevenue,
          totalCustomers,
          unreadMessages,
        });

        // Generate mock revenue data for chart
        const monthlyRevenueMap = new Map<string, number>();
        orders.forEach(order => {
          const month = new Date(order.orderDate).toLocaleString('default', { month: 'short' });
          monthlyRevenueMap.set(month, (monthlyRevenueMap.get(month) || 0) + order.total);
        });
        const chartData = Array.from(monthlyRevenueMap.entries()).map(([name, revenue]) => ({ name, revenue }));
        setRevenueData(chartData);

      } catch (error) {
        showNotification('Failed to fetch dashboard data.', 'error');
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <Card title="Total Orders" className="col-span-1">
        <p className="text-3xl font-bold text-gray-900">{stats?.totalOrders}</p>
      </Card>
      <Card title="Pending Orders" className="col-span-1">
        <p className="text-3xl font-bold text-orange-500">{stats?.pendingOrders}</p>
      </Card>
      <Card title="Total Revenue" className="col-span-1">
        <p className="text-3xl font-bold text-green-600">${stats?.totalRevenue.toFixed(2)}</p>
      </Card>
      <Card title="Total Customers" className="col-span-1">
        <p className="text-3xl font-bold text-blue-600">{stats?.totalCustomers}</p>
      </Card>
      <Card title="Unread Messages" className="col-span-1">
        <p className="text-3xl font-bold text-purple-600">{stats?.unreadMessages}</p>
      </Card>

      <Card title="Revenue Trend" className="lg:col-span-3 col-span-1 md:col-span-2">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={revenueData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '8px' }}
              labelStyle={{ color: '#374151', fontWeight: 'bold' }}
              itemStyle={{ color: '#1f2937' }}
            />
            <Legend wrapperStyle={{ paddingTop: '16px' }} />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" activeDot={{ r: 8 }} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Additional dashboard widgets can be added here */}
      <Card title="Recent Activity" className="lg:col-span-4 col-span-1 md:col-span-2">
        <ul className="divide-y divide-gray-200">
          <li className="py-2">New order #1001 from John Doe</li>
          <li className="py-2">Customer Jane Smith updated contact info</li>
          <li className="py-2">Product "Wireless Earbuds" low on stock (5 left)</li>
        </ul>
      </Card>
    </div>
  );
};