'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import { api } from '@/lib/api';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  image_url: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  payment_method: string;
  shipping_address: string;
  phone_number: string;
  created_at: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadOrder(params.id as string);
    }
  }, [params.id]);

  const loadOrder = async (id: string) => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: Order }>(`/api/orders/${id}`);
      if (response.success) {
        setOrder(response.data);
      }
    } catch (error) {
      console.error('Error loading order:', error);
      router.push('/');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <p className="text-gray-500">Không tìm thấy đơn hàng</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 flex items-center gap-4">
          <CheckCircleOutlined style={{ fontSize: '48px', color: '#22c55e' }} />
          <div>
            <h1 className="text-2xl font-bold text-green-800 mb-2">Đặt hàng thành công!</h1>
            <p className="text-green-700">
              Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-black mb-4">Thông tin đơn hàng</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="text-black font-medium">#{order.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày đặt:</span>
                  <span className="text-black font-medium">{formatDate(order.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thanh toán:</span>
                  <span className="text-black font-medium">
                    {order.payment_method === 'wallet' ? 'Ví điện tử' : order.payment_method}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-black mb-4">Thông tin giao hàng</h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-gray-600 mb-1">Địa chỉ:</p>
                  <p className="text-black font-medium">{order.shipping_address}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Số điện thoại:</p>
                  <p className="text-black font-medium">{order.phone_number}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-black mb-4">Sản phẩm đã mua</h2>
              
              <div className="divide-y">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 flex gap-4">
                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={item.image_url && item.image_url.trim() ? (item.image_url.startsWith('http') ? item.image_url : `http://localhost:3000${item.image_url}`) : '/placeholder.png'}
                        alt={item.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.png';
                        }}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-black mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                      <p className="text-blue-600 font-bold mt-1">{formatPrice(item.price)}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-black">{formatPrice(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold text-black mb-4">Tổng đơn hàng</h2>
              
              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between text-black">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>
                <div className="flex justify-between text-black">
                  <span>Phí vận chuyển:</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-black mb-6">
                <span>Tổng cộng:</span>
                <span className="text-blue-600">{formatPrice(order.total_amount)}</span>
              </div>

              <button
                onClick={() => router.push('/')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors mb-3 cursor-pointer"
              >
                Tiếp tục mua sắm
              </button>
              
              {order.status === 'delivered' && (
                <button
                  onClick={() => router.push(`/orders/${order.id}/review`)}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors mb-3 cursor-pointer"
                >
                  Đánh giá đơn hàng
                </button>
              )}
              
              <button
                onClick={() => router.push('/profile')}
                className="w-full border border-gray-300 text-black py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Xem đơn hàng của tôi
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
