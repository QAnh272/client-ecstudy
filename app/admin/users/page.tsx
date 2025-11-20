'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { api } from '@/lib/api';
import { SearchOutlined, ShoppingOutlined, UserOutlined, CrownOutlined } from '@ant-design/icons';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: User[] }>('/api/users');
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserOrders = async (userId: string) => {
    try {
      setLoadingOrders(true);
      const response = await api.get<{ success: boolean; data: Order[] }>(`/api/orders/user/${userId}`);
      setUserOrders(response.data || []);
    } catch (error) {
      console.error('Error loading user orders:', error);
      setUserOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleViewOrders = async (user: User) => {
    setSelectedUser(user);
    setShowOrdersModal(true);
    await loadUserOrders(user.id);
  };

  const handlePromoteToAdmin = async (userId: string) => {
    if (!confirm('Bạn có chắc muốn phân quyền admin cho user này?')) return;

    try {
      await api.post(`/api/users/${userId}/promote`);
      alert('Đã phân quyền admin thành công!');
      loadUsers();
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleRevokeAdmin = async (userId: string) => {
    if (!confirm('Bạn có chắc muốn thu hồi quyền admin?')) return;

    try {
      await api.post(`/api/users/${userId}/revoke`);
      alert('Đã thu hồi quyền admin!');
      loadUsers();
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra');
    }
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      pending: 'Chờ thanh toán',
      paid: 'Đã thanh toán',
      processing: 'Đang xử lý',
      shipped: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy',
    };
    return texts[status] || status;
  };

  return (
    <AdminLayout activePage="users">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>
          <div className="relative flex-1 max-w-md ml-4">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <SearchOutlined className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Đang tải...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Tên người dùng</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Vai trò</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Ngày tạo</th>
                    <th className="text-right py-3 px-4 text-gray-600 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900 font-medium">
                        <div className="flex items-center gap-2">
                          <UserOutlined className="text-gray-400" />
                          {user.username}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{user.email}</td>
                      <td className="py-3 px-4">
                        {user.role === 'admin' ? (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-medium flex items-center gap-1 w-fit">
                            <CrownOutlined />
                            Admin
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                            Khách hàng
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleViewOrders(user)}
                          className="text-blue-600 hover:text-blue-700 mr-3 cursor-pointer"
                          title="Xem đơn hàng"
                        >
                          <ShoppingOutlined />
                        </button>
                        {user.role === 'customer' ? (
                          <button
                            onClick={() => handlePromoteToAdmin(user.id)}
                            className="text-green-600 hover:text-green-700 cursor-pointer"
                            title="Phân quyền Admin"
                          >
                            <CrownOutlined />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRevokeAdmin(user.id)}
                            className="text-red-600 hover:text-red-700 cursor-pointer"
                            title="Thu hồi Admin"
                          >
                            <CrownOutlined />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Orders Modal */}
      {showOrdersModal && selectedUser && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowOrdersModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h3 className="text-2xl font-bold text-gray-800">
                Đơn hàng của {selectedUser.username}
              </h3>
              <button
                onClick={() => setShowOrdersModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl cursor-pointer"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {loadingOrders ? (
                <div className="text-center py-8 text-gray-600">Đang tải...</div>
              ) : userOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Người dùng chưa có đơn hàng nào
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm text-gray-500">Mã đơn: {order.id.substring(0, 8)}</p>
                          <p className="text-sm text-gray-500">
                            Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      
                      {/* Order Items */}
                      <div className="space-y-2 mb-3">
                        {order.items && order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                            <span className="text-gray-700">
                              {item.product_name} x {item.quantity}
                            </span>
                            <span className="text-gray-900 font-medium">
                              {item.subtotal.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t">
                        <span className="text-gray-700 font-medium">Tổng cộng:</span>
                        <span className="text-lg font-bold text-blue-600">
                          {order.total_amount.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
