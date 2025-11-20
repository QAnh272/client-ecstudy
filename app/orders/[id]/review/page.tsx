'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { api } from '@/lib/api';
import { StarFilled, StarOutlined } from '@ant-design/icons';

interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export default function ReviewOrderPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState<Record<string, { rating: number; content: string }>>({});

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
        
        // Initialize reviews object
        const initialReviews: Record<string, { rating: number; content: string }> = {};
        response.data.items.forEach(item => {
          initialReviews[item.product_id] = { rating: 5, content: '' };
        });
        setReviews(initialReviews);
      }
    } catch (error) {
      console.error('Error loading order:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const setRating = (productId: string, rating: number) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], rating }
    }));
  };

  const setContent = (productId: string, content: string) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], content }
    }));
  };

  const handleSubmit = async () => {
    if (!order) return;

    // Validate
    for (const item of order.items) {
      if (!reviews[item.product_id]?.content.trim()) {
        alert(`Vui lòng nhập nhận xét cho sản phẩm: ${item.name}`);
        return;
      }
    }

    try {
      setSubmitting(true);
      
      // Submit each review
      for (const item of order.items) {
        const review = reviews[item.product_id];
        await api.post('/api/comments', {
          product_id: item.product_id,
          order_id: order.id,
          rating: review.rating,
          content: review.content
        });
      }

      alert('Cảm ơn bạn đã đánh giá!');
      router.push('/profile');
    } catch (error) {
      console.error('Error submitting reviews:', error);
      alert('Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + 'đ';
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

  if (!order || order.status !== 'delivered') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <p className="text-gray-500">Chỉ có thể đánh giá đơn hàng đã giao thành công</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-black mb-8">Đánh giá đơn hàng</h1>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <p className="text-gray-600 mb-2">Mã đơn hàng</p>
            <p className="text-xl font-bold text-black">#{order.id.slice(0, 8).toUpperCase()}</p>
          </div>

          {/* Review each product */}
          <div className="space-y-6">
            {order.items.map((item) => (
              <div key={item.product_id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="border-b pb-4 mb-4">
                  <h3 className="text-lg font-bold text-black mb-2">{item.name}</h3>
                  <p className="text-gray-600">
                    Số lượng: {item.quantity} • Giá: {formatPrice(item.price)}
                  </p>
                </div>

                {/* Rating */}
                <div className="mb-4">
                  <label className="block text-black font-medium mb-2">
                    Đánh giá sản phẩm <span className="text-red-600">*</span>
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(item.product_id, star)}
                        className="text-3xl focus:outline-none transition-colors cursor-pointer"
                      >
                        {star <= reviews[item.product_id]?.rating ? (
                          <StarFilled className="text-yellow-400" />
                        ) : (
                          <StarOutlined className="text-gray-300" />
                        )}
                      </button>
                    ))}
                    <span className="ml-2 text-black font-medium self-center">
                      {reviews[item.product_id]?.rating || 0} sao
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-black font-medium mb-2">
                    Nhận xét của bạn <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={reviews[item.product_id]?.content || ''}
                    onChange={(e) => setContent(item.product_id, e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black"
                    rows={4}
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-300 cursor-pointer"
            >
              {submitting ? 'Đang gửi...' : 'GỬI ĐÁNH GIÁ'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
