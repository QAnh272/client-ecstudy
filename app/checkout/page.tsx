'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import { api } from '@/lib/api';
import { ShoppingCartOutlined, WalletOutlined, HomeOutlined, PhoneOutlined } from '@ant-design/icons';

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

interface Wallet {
  balance: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form data
  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      setLoading(true);
      const [cartRes, walletRes] = await Promise.all([
        api.get<{ success: boolean; data: { items: CartItem[]; total: number } }>('/api/cart'),
        api.get<{ success: boolean; data: Wallet }>('/api/wallet')
      ]);

      if (cartRes.success) {
        setCartItems(cartRes.data.items);
        if (cartRes.data.items.length === 0) {
          router.push('/cart');
        }
      }
      
      if (walletRes.success) {
        setWallet(walletRes.data);
      }
    } catch (error) {
      console.error('Error loading checkout data:', error);
      router.push('/cart');
    } finally {
      setLoading(false);
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

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shippingAddress.trim() || !phoneNumber.trim()) {
      alert('Vui lòng nhập đầy đủ thông tin giao hàng');
      return;
    }

    const total = calculateTotal();
    if (wallet && wallet.balance < total) {
      alert('Số dư ví không đủ để thanh toán. Vui lòng nạp thêm tiền.');
      router.push('/wallet');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post<{ success: boolean; data: { id: string } }>('/api/orders', {
        payment_method: 'wallet',
        shipping_address: shippingAddress,
        phone_number: phoneNumber
      });

      if (response.success) {
        alert('Đặt hàng thành công!');
        router.push(`/orders/${response.data.id}`);
      }
    } catch (error: unknown) {
      console.error('Error creating order:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { message?: string } } };
        alert(err.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
      } else {
        alert('Có lỗi xảy ra khi đặt hàng');
      }
    } finally {
      setSubmitting(false);
    }
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

  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-black mb-8">Thanh toán đơn hàng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left: Shipping Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
              <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <HomeOutlined /> Thông tin giao hàng
              </h2>
              
              <form onSubmit={handleSubmitOrder}>
                <div className="mb-4">
                  <label className="block text-black font-medium mb-2">
                    Địa chỉ giao hàng <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Nhập địa chỉ đầy đủ (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black"
                    rows={3}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-black font-medium mb-2">
                    Số điện thoại <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <PhoneOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Nhập số điện thoại"
                      className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-3 text-black"
                      required
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <ShoppingCartOutlined /> Sản phẩm đặt mua ({cartItems.length})
              </h2>
              
              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-4 flex gap-4">
                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={item.image_url || '/placeholder.png'}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized={item.image_url?.includes('localhost')}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-black mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-500 mb-1">Số lượng: {item.quantity}</p>
                      <p className="text-blue-600 font-bold">{formatPrice(item.price)}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-black">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 sticky top-4">
              <h2 className="text-xl font-bold text-black mb-4">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between text-black">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-black">
                  <span>Phí vận chuyển:</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-black mb-6">
                <span>Tổng cộng:</span>
                <span className="text-blue-600">{formatPrice(total)}</span>
              </div>

              {/* Payment Method */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">Phương thức thanh toán</p>
                <div className="flex items-center gap-2 text-black font-medium">
                  <WalletOutlined className="text-blue-600" />
                  <span>Ví EC Study</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  * Chỉ chấp nhận thanh toán qua ví điện tử EC Study
                </p>
              </div>

              {/* Wallet Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <WalletOutlined />
                  <span className="font-medium">Số dư ví hiện tại</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {wallet ? formatPrice(wallet.balance) : '0đ'}
                </p>
                {wallet && wallet.balance < total && (
                  <div className="mt-3">
                    <p className="text-red-600 text-sm mb-2">
                      Số dư không đủ để thanh toán
                    </p>
                    <button
                      onClick={() => router.push('/wallet')}
                      className="text-sm text-blue-600 hover:underline cursor-pointer"
                    >
                      Nạp thêm {formatPrice(total - wallet.balance)} →
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={submitting || !wallet || wallet.balance < total || !shippingAddress || !phoneNumber}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? 'Đang xử lý...' : 'THANH TOÁN BẰNG VÍ'}
              </button>

              {!wallet || wallet.balance < total ? (
                <p className="text-xs text-red-600 text-center mt-3">
                  Vui lòng nạp tiền vào ví để thanh toán
                </p>
              ) : (
                <p className="text-xs text-gray-500 text-center mt-3">
                  Số tiền sẽ được trừ trực tiếp từ ví của bạn
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
