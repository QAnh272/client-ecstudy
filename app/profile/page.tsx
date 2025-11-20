'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import {api} from '@/lib/api';
import Header from '@/components/Header';
import { UserOutlined, ShoppingOutlined, EditOutlined, SaveOutlined, StarOutlined } from '@ant-design/icons';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  shipping_address?: string;
  phone_number?: string;
  items: OrderItem[];
  user_rating?: number | null;
  average_rating?: number | null;
  rating_count?: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [ratingOrder, setRatingOrder] = useState<string | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  useEffect(() => {
    const currentUser = authService.getStoredUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    setFormData({
      username: currentUser.username,
      email: currentUser.email,
    });
    
    // Load orders from API
    loadOrders();
  }, [router]);

  const loadOrders = async () => {
    try {
      const response = await api.get('/api/orders/my-orders');
      const data: any = response.data;
      
      // Handle both wrapped and unwrapped responses
      let ordersData = [];
      if (data && data.success && data.data) {
        ordersData = data.data;
      } else if (Array.isArray(data)) {
        ordersData = data;
      }
      
      console.log('Orders loaded:', ordersData.length, 'orders');
      console.log('Sample order:', ordersData[0]);
      setOrders(ordersData);
    } catch (error: any) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaveLoading(true);
      setMessage(null);

      // TODO: Call API to update user profile
      // await api.put('/api/users/profile', formData);
      
      // Update localStorage
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      setEditMode(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Cập nhật thất bại. Vui lòng thử lại.' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRating = async (orderId: string, rating: number) => {
    try {
      await api.post(`/api/ratings/orders/${orderId}`, { rating });
      setMessage({ type: 'success', text: 'Đánh giá thành công!' });
      // Reload orders to get updated ratings
      loadOrders();
    } catch (error) {
      setMessage({ type: 'error', text: 'Đánh giá thất bại. Vui lòng thử lại.' });
    }
  };

  const renderStars = (orderId: string, currentRating: number | null | undefined) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRating(orderId, star)}
            onMouseEnter={() => {
              setRatingOrder(orderId);
              setHoveredRating(star);
            }}
            onMouseLeave={() => {
              setRatingOrder(null);
              setHoveredRating(0);
            }}
            className="text-2xl transition-colors focus:outline-none cursor-pointer"
          >
            <StarOutlined 
              style={{ 
                color: (ratingOrder === orderId ? hoveredRating : currentRating || 0) >= star 
                  ? '#fadb14' 
                  : '#d9d9d9' 
              }} 
            />
          </button>
        ))}
      </div>
    );
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Chờ xử lý',
      paid: 'Đã thanh toán',
      processing: 'Đang xử lý',
      shipped: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <UserOutlined className="text-blue-600" />
                  Thông tin cá nhân
                </h2>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <EditOutlined />
                    Chỉnh sửa
                  </button>
                )}
              </div>

              {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên đăng nhập
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  ) : (
                    <div className="text-gray-900 font-medium">{user?.username}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  {editMode ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  ) : (
                    <div className="text-gray-900">{user?.email}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vai trò
                  </label>
                  <div className="text-gray-900">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      user?.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                    </span>
                  </div>
                </div>

                {editMode && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saveLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <SaveOutlined />
                      {saveLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setFormData({
                          username: user.username,
                          email: user.email,
                        });
                        setMessage(null);
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <ShoppingOutlined className="text-blue-600" />
                Lịch sử đơn hàng
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingOutlined className="text-6xl mb-4" />
                  <p>Bạn chưa có đơn hàng nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-sm text-gray-600">
                            Mã đơn: <span className="font-medium text-gray-900">#{order.id.substring(0, 8)}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Ngày đặt: {new Date(order.created_at).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>

                      <div className="border-t border-gray-100 pt-3 mb-3">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm py-1">
                              <span className="text-gray-700">
                                {item.product_name} x{item.quantity}
                              </span>
                              <span className="font-medium text-gray-900">
                                {(item.subtotal || item.price * item.quantity).toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 text-sm">Không có sản phẩm</div>
                        )}
                      </div>

                      <div className="border-t border-gray-100 pt-3">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-gray-700 font-medium">Tổng cộng:</span>
                          <span className="text-lg font-bold text-blue-600">
                            {order.total_amount.toLocaleString('vi-VN')}đ
                          </span>
                        </div>

                        {order.status === 'delivered' && (
                          <div className="space-y-3">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">
                                  Đánh giá của bạn:
                                </span>
                                {order.user_rating && (
                                  <span className="text-sm text-gray-500">
                                    ({order.user_rating} sao)
                                  </span>
                                )}
                              </div>
                              {renderStars(order.id, order.user_rating)}
                            </div>
                            
                            {order.rating_count !== undefined && order.rating_count > 0 && (
                              <div className="text-sm text-gray-600 flex items-center gap-2">
                                <StarOutlined style={{ color: '#fadb14' }} />
                                <span>
                                  Đánh giá trung bình: <strong>{order.average_rating?.toFixed(1)}</strong> sao 
                                  ({order.rating_count} đánh giá)
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
