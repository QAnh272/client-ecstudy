'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { ShoppingOutlined, UserOutlined, DollarOutlined, FileTextOutlined } from '@ant-design/icons';
import {api} from '@/lib/api';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: RecentOrder[];
}

interface RecentOrder {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
}

interface RawOrder {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Loading stats...');
      
      // Gọi song song các API
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        api.get<ApiResponse<unknown[]>>('/api/products'),
        api.get<ApiResponse<RawOrder[]>>('/api/orders'),
        api.get<ApiResponse<User[]>>('/api/users')
      ]);

      console.log('Products response:', productsRes);
      console.log('Orders response:', ordersRes);
      console.log('Users response:', usersRes);

      // Response interceptor đã trả về response.data, nên ta truy cập trực tiếp
      const products = (productsRes as ApiResponse<unknown[]>).data || [];
      const orders: RawOrder[] = (ordersRes as ApiResponse<RawOrder[]>).data || [];
      const users: User[] = (usersRes as ApiResponse<User[]>).data || [];

      console.log('Products:', products.length);
      console.log('Orders:', orders.length);
      console.log('Users:', users.length);

      const totalProducts = products.length;
      const totalOrders = orders.length;
      const totalUsers = users.length; // Đếm tất cả users (bao gồm cả admin)
      
      // Tính tổng doanh thu từ các đơn hàng đã thanh toán
      const totalRevenue = orders
        .filter((o: RawOrder) => ['paid', 'processing', 'shipped', 'delivered'].includes(o.status))
        .reduce((sum: number, o: RawOrder) => sum + parseFloat(o.total_amount.toString()), 0);

      // Lấy 5 đơn hàng gần nhất và thêm thông tin user
      const recentOrders: RecentOrder[] = orders
        .sort((a: RawOrder, b: RawOrder) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 5)
        .map((order: RawOrder) => {
          const user = users.find((u: User) => u.id === order.user_id);
          return {
            id: order.id,
            customer: user?.username || 'Unknown',
            email: user?.email || '',
            total: parseFloat(order.total_amount.toString()),
            status: order.status,
            createdAt: order.created_at
          };
        });

      console.log('Final stats:', {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
        recentOrders: recentOrders.length
      });

      setStats({
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
        recentOrders
      });
    } catch (error: unknown) {
      console.error('Error loading stats:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi khi tải dữ liệu thống kê';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'Tổng sản phẩm', 
      value: stats.totalProducts, 
      icon: <ShoppingOutlined />, 
      color: 'bg-blue-500',
      href: '/admin/products'
    },
    { 
      title: 'Đơn hàng', 
      value: stats.totalOrders, 
      icon: <FileTextOutlined />, 
      color: 'bg-green-500',
      href: '/admin/orders'
    },
    { 
      title: 'Người dùng', 
      value: stats.totalUsers, 
      icon: <UserOutlined />, 
      color: 'bg-purple-500',
      href: '/admin/users'
    },
    { 
      title: 'Doanh thu', 
      value: `${stats.totalRevenue.toLocaleString('vi-VN')}đ`, 
      icon: <DollarOutlined />, 
      color: 'bg-orange-500',
      href: '/admin/orders'
    },
  ];

  if (loading) {
    return (
      <AdminLayout activePage="dashboard">
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600">Đang tải...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activePage="dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} text-white p-4 rounded-lg`}>
                  <span className="text-3xl">{card.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Đơn hàng gần đây</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Mã đơn</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Khách hàng</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Tổng tiền</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">#{order.id}</td>
                    <td className="py-3 px-4 text-gray-900">{order.customer}</td>
                    <td className="py-3 px-4 text-gray-900">{order.total.toLocaleString('vi-VN')}đ</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'paid' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'pending' ? 'Chờ thanh toán' :
                         order.status === 'paid' ? 'Đã thanh toán' :
                         order.status === 'processing' ? 'Đang xử lý' :
                         order.status === 'shipped' ? 'Đang giao hàng' :
                         order.status === 'delivered' ? 'Đã giao hàng' :
                         order.status === 'cancelled' ? 'Đã hủy' : order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
