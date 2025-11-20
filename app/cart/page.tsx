'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import { api } from '@/lib/api';
import { DeleteOutlined, MinusOutlined, PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  name: string;
  price: number;
  stock: number;
  image_url: string;
  subtotal: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: { items: CartItem[]; total: number; item_count: number } }>('/api/cart');
      if (response.success) {
        setCartItems(response.data.items);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    try {
      await api.put(`/api/cart/items/${productId}`, { quantity: newQuantity });
      await loadCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await api.delete(`/api/cart/items/${productId}`);
      await loadCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const clearCart = async () => {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) return;
    try {
      await api.delete('/api/cart');
      await loadCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl text-black font-bold mb-8">Giỏ hàng của bạn</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingCartOutlined style={{ fontSize: '64px' }} className="text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-4">Giỏ hàng của bạn đang trống</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="font-bold text-black text-lg">Sản phẩm ({cartItems.length})</h2>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 text-sm cursor-pointer"
                  >
                    Xóa tất cả
                  </button>
                </div>

                {/* Items List */}
                <div className="divide-y">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-3 md:p-4 flex gap-3 md:gap-4">
                      {/* Image */}
                      <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image_url || '/placeholder.png'}
                          alt={item.name}
                          fill
                          className="object-cover"
                          unoptimized={item.image_url?.includes('localhost')}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="font-medium text-black mb-2">{item.name}</h3>
                        <p className="text-blue-600 font-bold text-lg mb-3">
                          {formatPrice(item.price)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-3">
                          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <MinusOutlined />
                            </button>
                            <span className="w-12 text-center text-black font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <PlusOutlined />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeItem(item.product_id)}
                            className="text-red-600 hover:text-red-700 p-2 cursor-pointer"
                          >
                            <DeleteOutlined />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <p className="text-black font-bold text-lg">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="font-bold text-black text-lg mb-4">Tóm tắt đơn hàng</h2>
                
                <div className="space-y-3 mb-4 pb-4 border-b">
                  <div className="flex justify-between text-black">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                  <div className="flex justify-between text-black">
                    <span>Phí vận chuyển:</span>
                    <span>Miễn phí</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold text-black mb-6">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">{formatPrice(calculateTotal())}</span>
                </div>

                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors mb-3 cursor-pointer"
                >
                  Tiến hành thanh toán
                </button>
                
                <button
                  onClick={() => router.push('/')}
                  className="w-full border border-gray-300 text-black py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
