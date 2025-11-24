'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';
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
  selected?: boolean;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(true);

  // Modal states
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'warning' }>({
    isOpen: false,
    message: '',
    type: 'success'
  });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning';
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => { },
    type: 'warning'
  });

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: { items: CartItem[]; total: number; item_count: number } }>('/api/cart');
      if (response.success) {
        setCartItems(response.data.items.map(item => ({ ...item, selected: true })));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setCartItems(cartItems.map(item => ({ ...item, selected: newSelectAll })));
  };

  const toggleSelectItem = (productId: string) => {
    const newItems = cartItems.map(item =>
      item.product_id === productId ? { ...item, selected: !item.selected } : item
    );
    setCartItems(newItems);
    setSelectAll(newItems.every(item => item.selected));
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    try {
      // Cập nhật UI ngay lập tức (optimistic update)
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.product_id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      // Gọi API trong background
      await api.put(`/api/cart/items/${productId}`, { quantity: newQuantity });
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Nếu lỗi, reload lại để đồng bộ
      await loadCart();
    }
  };

  const removeItem = async (productId: string) => {
    try {
      // Cập nhật UI ngay
      setCartItems(prevItems => prevItems.filter(item => item.product_id !== productId));

      // Gọi API trong background
      await api.delete(`/api/cart/items/${productId}`);
    } catch (error) {
      console.error('Error removing item:', error);
      await loadCart();
    }
  };

  const deleteSelected = async () => {
    const selectedItems = cartItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
      setAlertModal({
        isOpen: true,
        message: 'Vui lòng chọn sản phẩm cần xóa',
        type: 'warning'
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      message: `Bạn có chắc muốn xóa ${selectedItems.length} sản phẩm đã chọn?`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });

        try {
          // Xóa UI ngay
          setCartItems(prevItems => prevItems.filter(item => !item.selected));

          // Xóa từng item qua API
          await Promise.all(
            selectedItems.map(item => api.delete(`/api/cart/items/${item.product_id}`))
          );

          setAlertModal({
            isOpen: true,
            message: 'Đã xóa sản phẩm thành công!',
            type: 'success'
          });
        } catch (error) {
          console.error('Error deleting selected items:', error);
          await loadCart();
          setAlertModal({
            isOpen: true,
            message: 'Có lỗi xảy ra khi xóa sản phẩm',
            type: 'error'
          });
        }
      }
    });
  };

  const clearCart = async () => {
    setConfirmModal({
      isOpen: true,
      message: 'Bạn có chắc muốn xóa toàn bộ giỏ hàng?',
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });

        try {
          // Xóa UI ngay
          setCartItems([]);

          // Xóa qua API
          await api.delete('/api/cart');

          setAlertModal({
            isOpen: true,
            message: 'Đã xóa toàn bộ giỏ hàng!',
            type: 'success'
          });
        } catch (error) {
          console.error('Error clearing cart:', error);
          await loadCart();
          setAlertModal({
            isOpen: true,
            message: 'Có lỗi xảy ra khi xóa giỏ hàng',
            type: 'error'
          });
        }
      }
    });
  };

  const calculateTotal = () => {
    return cartItems
      .filter(item => item.selected)
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getSelectedCount = () => {
    return cartItems.filter(item => item.selected).length;
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

      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl md:text-3xl text-black font-bold mb-6">Giỏ hàng</h1>

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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Cart Items */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Header Row - Shopee Style */}
                <div className="bg-white border-b px-4 py-3">
                  <div className="flex items-center">
                    <div className="flex items-center flex-1">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        className="w-5 h-5 text-blue-600 cursor-pointer mr-4"
                      />
                      <span className="text-gray-700 font-medium">Sản phẩm</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-gray-500 text-sm">
                      <span className="w-32 text-center">Đơn Giá</span>
                      <span className="w-32 text-center">Số Lượng</span>
                      <span className="w-32 text-center">Số Tiền</span>
                      <span className="w-16 text-center">Thao Tác</span>
                    </div>
                  </div>
                </div>

                {/* Delete Selected Button */}
                {getSelectedCount() > 0 && (
                  <div className="bg-orange-50 border-b px-4 py-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Đã chọn {getSelectedCount()} sản phẩm
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={deleteSelected}
                        className="text-red-600 hover:text-red-700 font-medium text-sm cursor-pointer flex items-center gap-1"
                      >
                        <DeleteOutlined />
                        Xóa sản phẩm đã chọn
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={clearCart}
                        className="text-red-600 hover:text-red-700 font-medium text-sm cursor-pointer flex items-center gap-1"
                      >
                        <DeleteOutlined />
                        Xóa tất cả
                      </button>
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="divide-y">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleSelectItem(item.product_id)}
                          className="w-5 h-5 text-blue-600 cursor-pointer shrink-0"
                        />

                        {/* Product Info */}
                        <div className="flex items-center flex-1 gap-3">
                          {/* Image */}
                          <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={item.image_url && item.image_url.trim() ? (item.image_url.startsWith('http') ? item.image_url : `http://localhost:3000${item.image_url}`) : '/placeholder.png'}
                              alt={item.name || 'Product'}
                              fill
                              className="object-cover"
                              unoptimized
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.png';
                              }}
                            />
                          </div>

                          {/* Name - Mobile/Desktop */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-black line-clamp-2">{item.name}</h3>
                            {/* Mobile Price & Quantity */}
                            <div className="md:hidden mt-2 space-y-2">
                              <p className="text-orange-600 font-semibold">
                                ₫{formatPrice(item.price)}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center border border-gray-300 rounded">
                                  <button
                                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className="w-8 h-8 flex text-gray-600 items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                  >
                                    <MinusOutlined />
                                  </button>
                                  <span className="w-12 text-center text-black">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                    disabled={item.quantity >= item.stock}
                                    className="w-8 h-8 flex text-gray-600 items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                  >
                                    <PlusOutlined />
                                  </button>
                                </div>
                                <p className="text-orange-600 font-bold">
                                  ₫{formatPrice(item.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Desktop - Price, Quantity, Subtotal, Action */}
                        <div className="hidden md:flex items-center gap-8">
                          {/* Price */}
                          <div className="w-32 text-center">
                            <p className="text-gray-900">₫{formatPrice(item.price)}</p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="w-32 flex justify-center">
                            <div className="flex items-center border border-gray-300 rounded">
                              <button
                                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-8 h-8 flex text-gray-600 items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <MinusOutlined />
                              </button>
                              <span className="w-12 text-center text-black">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                                className="w-8 h-8 flex text-gray-600 items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <PlusOutlined />
                              </button>
                            </div>
                          </div>

                          {/* Subtotal */}
                          <div className="w-32 text-center">
                            <p className="text-orange-600 font-bold">
                              ₫{formatPrice(item.price * item.quantity)}
                            </p>
                          </div>

                          {/* Delete */}
                          <div className="w-16 text-center">
                            <button
                              onClick={() => removeItem(item.product_id)}
                              className="text-gray-400 hover:text-red-600 p-2 cursor-pointer transition-colors"
                            >
                              <DeleteOutlined />
                            </button>
                          </div>
                        </div>

                        {/* Mobile Delete */}
                        <button
                          onClick={() => removeItem(item.product_id)}
                          className="md:hidden text-gray-400 hover:text-red-600 p-2 cursor-pointer shrink-0"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Bottom Bar - Shopee Style */}
            <div className="lg:col-span-4">
              <div className="sticky top-4">
                {/* Summary Card */}
                <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <span className="text-gray-700">Tạm tính ({getSelectedCount()} sản phẩm):</span>
                    <span className="text-xl font-bold text-gray-900">₫{formatPrice(calculateTotal())}</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Phí vận chuyển:</span>
                      <span className="text-green-600 font-medium">Miễn phí</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Card */}
                <div className="bg-white rounded-lg shadow-sm p-5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-700">Tổng thanh toán:</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600">₫{formatPrice(calculateTotal())}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push('/checkout')}
                    disabled={getSelectedCount() === 0}
                    className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                  >
                    Mua Hàng ({getSelectedCount()})
                  </button>

                  <button
                    onClick={() => router.push('/')}
                    className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        message={alertModal.message}
        type={alertModal.type}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
}
