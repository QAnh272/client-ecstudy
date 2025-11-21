'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { api } from '@/lib/api';
import { ShoppingOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';

interface Order {
  id: string;
  user_id: string;
  username: string;
  email: string;
  total_amount: number;
  status: string;
  payment_method: string;
  shipping_address: string;
  phone_number: string;
  created_at: string;
  item_count: number;
  items?: Array<{
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = selectedStatus !== 'all' ? `?status=${selectedStatus}` : '';
      const response = await api.get<{ success: boolean; data: Order[] }>(`/api/orders${params}`);
      if (response.success) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + 'đ';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
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
    const texts: Record<string, string> = {
      pending: 'Chờ thanh toán',
      paid: 'Đã thanh toán',
      processing: 'Đang xử lý',
      shipped: 'Đang giao hàng',
      delivered: 'Đã giao hàng',
      cancelled: 'Đã hủy',
    };
    return texts[status] || status;
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
      alert('Cập nhật trạng thái thành công!');
      loadOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      order.username?.toLowerCase().includes(search) ||
      order.email?.toLowerCase().includes(search) ||
      order.id.toLowerCase().includes(search) ||
      order.phone_number?.toLowerCase().includes(search)
    );
  });

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, searchQuery]);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total_amount, 0),
  };

  return (
    <AdminLayout activePage="orders">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ShoppingOutlined style={{ fontSize: '32px' }} className="text-blue-600" color='#000'/>
            <h1 className="text-3xl font-bold text-black">Quản lý đơn hàng</h1>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-600">
            <p className="text-gray-600 text-sm mb-1">Tổng đơn hàng</p>
            <p className="text-2xl font-bold text-black">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-600">
            <p className="text-gray-600 text-sm mb-1">Đã thanh toán</p>
            <p className="text-2xl font-bold text-black">{stats.paid}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-600">
            <p className="text-gray-600 text-sm mb-1">Đang xử lý</p>
            <p className="text-2xl font-bold text-black">{stats.processing + stats.shipped}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-600">
            <p className="text-gray-600 text-sm mb-1">Doanh thu</p>
            <p className="text-2xl font-bold text-black">{formatPrice(stats.totalRevenue)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên, email, mã đơn, SĐT..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-black"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-black"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="processing">Đang xử lý</option>
              <option value="shipped">Đang giao hàng</option>
              <option value="delivered">Đã giao hàng</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Đang tải...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">Không có đơn hàng nào</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Mã đơn</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Khách hàng</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Liên hệ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Sản phẩm</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Số tiền</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Ngày đặt</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-black">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-black">{order.username}</p>
                          <p className="text-sm text-gray-500">{order.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p className="text-black">{order.phone_number || '-'}</p>
                          <p className="text-gray-500 line-clamp-1" title={order.shipping_address}>
                            {order.shipping_address || '-'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        {order.items && order.items.length > 0 ? (
                          <ul className="text-sm space-y-1">
                            {order.items.map((it) => (
                              <li key={it.id} className="text-gray-700 flex justify-between">
                                <span className="truncate">{it.product_name}</span>
                                <span className="ml-2 font-medium">x{it.quantity}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-sm text-gray-500">-</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-black">{formatPrice(order.total_amount)}</p>
                        <p className="text-xs text-gray-500">{order.item_count || 0} sản phẩm</p>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
                        >
                          <option value="pending">Chờ thanh toán</option>
                          <option value="paid">Đã thanh toán</option>
                          <option value="processing">Đang xử lý</option>
                          <option value="shipped">Đang giao hàng</option>
                          <option value="delivered">Đã giao hàng</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => router.push(`/orders/${order.id}`)}
                          className="text-blue-600 hover:text-blue-700 p-2 cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <EyeOutlined style={{ fontSize: '18px' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Trước
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-10 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white font-semibold shadow-md'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Sau
                </button>
              </div>
            )}
        </div>
      </div>
    </AdminLayout>
  );
}
