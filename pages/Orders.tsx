
import React, { useEffect, useState, useMemo } from 'react';
import { Card } from '../components/Card';
import { Table, TableColumn } from '../components/Table';
import { Order, OrderStatus } from '../types';
import { apiService } from '../services/apiService';
import { Button } from '../components/Button';
import { useNotifications } from '../context/NotificationContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { showNotification } = useNotifications();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const fetchedOrders = await apiService.getOrders();
        setOrders(fetchedOrders);
      } catch (error) {
        showNotification('Failed to fetch orders.', 'error');
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      setOrders(prevOrders =>
        prevOrders.map(order => (order.id === orderId ? { ...order, status: newStatus } : order))
      );
      showNotification(`Order ${orderId} status updated to ${newStatus}.`, 'success');
    } catch (error) {
      showNotification(`Failed to update status for order ${orderId}.`, 'error');
      console.error(`Error updating order ${orderId} status:`, error);
    }
  };

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(lowerCaseSearchTerm) ||
        order.customerName.toLowerCase().includes(lowerCaseSearchTerm) ||
        order.shippingAddress.toLowerCase().includes(lowerCaseSearchTerm) ||
        order.items.some(item => item.productName.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
    return filtered;
  }, [orders, filterStatus, searchTerm]);


  const columns: TableColumn<Order>[] = [
    { key: 'id', header: 'Order ID' },
    { key: 'customerName', header: 'Customer' },
    {
      key: 'total',
      header: 'Total',
      render: (order) => `$${order.total.toFixed(2)}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (order) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-800' :
            order.status === OrderStatus.SHIPPED ? 'bg-blue-100 text-blue-800' :
            order.status === OrderStatus.PENDING ? 'bg-orange-100 text-orange-800' :
            'bg-red-100 text-red-800'
          }`}
        >
          {order.status}
        </span>
      ),
    },
    { key: 'orderDate', header: 'Order Date' },
    {
      key: 'actions',
      header: 'Actions',
      render: (order) => (
        <div className="flex space-x-2">
          <select
            value={order.status}
            onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {Object.values(OrderStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <Button variant="outline" size="sm">
            Details
          </Button>
        </div>
      ),
      className: 'min-w-[150px]'
    },
  ];

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
        <input
          type="text"
          placeholder="Search orders..."
          className="p-2 border border-gray-300 rounded-md w-full sm:w-auto flex-grow max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border border-gray-300 rounded-md w-full sm:w-auto"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'all')}
        >
          <option value="all">All Statuses</option>
          {Object.values(OrderStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <Table data={filteredOrders} columns={columns} emptyMessage="No orders found." />
      )}
    </Card>
  );
};
