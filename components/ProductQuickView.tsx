'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CloseOutlined, MinusOutlined, PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { api } from '@/lib/api';
import { authService } from '@/services/authService';
import Modal from './Modal';
import AlertModal from './AlertModal';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
  product_code: string;
  description?: string;
  unit?: string;
}

interface ProductQuickViewProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductQuickView({ product, isOpen, onClose }: ProductQuickViewProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageError, setImageError] = useState(false);
  
  // Modal state
  const [alertModal, setAlertModal] = useState<{ 
    isOpen: boolean; 
    message: string; 
    type: 'success' | 'error' | 'warning' 
  }>({ 
    isOpen: false, 
    message: '', 
    type: 'success' 
  });

  // Reset state khi modal mở
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedImage(0);
      setImageError(false);
    }
  }, [isOpen]);

  // Memoize images array
  const images = useMemo(() => [
    product.image_url,
    product.image_url,
    product.image_url,
    product.image_url
  ], [product.image_url]);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + 'đ';
  }, []);

  const handleQuantityChange = useCallback((delta: number) => {
    setQuantity((prev) => {
      const newQuantity = prev + delta;
      if (newQuantity >= 1 && newQuantity <= product.stock) {
        return newQuantity;
      }
      return prev;
    });
  }, [product.stock]);

  const handleAddToCart = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setAlertModal({
        isOpen: true,
        message: 'Vui lòng đăng nhập để thêm vào giỏ hàng',
        type: 'warning'
      });
      setTimeout(() => router.push('/login'), 1500);
      return;
    }

    try {
      await api.post('/api/cart/items', {
        product_id: product.id,
        quantity: quantity
      });
      setAlertModal({
        isOpen: true,
        message: 'Đã thêm vào giỏ hàng!',
        type: 'success'
      });
      // Dispatch event to update cart count in header
      window.dispatchEvent(new Event('cartUpdated'));
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setAlertModal({
        isOpen: true,
        message: 'Có lỗi xảy ra khi thêm vào giỏ hàng',
        type: 'error'
      });
    }
  }, [product.id, quantity, router, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="5xl">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 md:top-4 md:right-4 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10 cursor-pointer"
      >
        <CloseOutlined className="text-black text-lg md:text-xl" />
      </button>

      <div className="overflow-y-auto max-h-[calc(90vh-2rem)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6">
            {/* Left: Images */}
            <div>
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                {imageError ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ShoppingCartOutlined style={{ fontSize: '64px' }} />
                  </div>
                ) : (
                  <Image
                    src={images[selectedImage] || '/placeholder.png'}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    onError={() => setImageError(true)}
                    unoptimized={images[selectedImage]?.includes('localhost')}
                    priority
                  />
                )}
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${selectedImage === idx ? 'border-blue-600' : 'border-transparent'
                      }`}
                  >
                    <Image
                      src={img || '/placeholder.png'}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      sizes="100px"
                      className="object-cover"
                      unoptimized={img?.includes('localhost')}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Product Info */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-black mb-3 md:mb-4">
                {product.name}
              </h2>

              {/* Brand and SKU */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 text-sm">
                <div>
                  <span className="text-black">Thương hiệu: </span>
                  <span className="text-blue-600 font-medium">Thiên Long</span>
                </div>
                <div className="hidden sm:block text-gray-300">|</div>
                <div>
                  <span className="text-black">Mã SP: </span>
                  <span className="font-medium text-black">{product.product_code}</span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-gray-300 text-base">★</span>
                ))}
                <span className="text-gray-400 text-sm ml-2">(0 đánh giá)</span>
              </div>

              {/* Price */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <span className="text-3xl font-bold text-blue-600">
                  {formatPrice(product.price)}
                </span>
              </div>

              {/* Category */}
              <div className="mb-4">
                <span className="text-black">Danh mục: </span>
                <span className="text-black font-medium">{product.category}</span>
              </div>

              {/* Stock */}
              <div className="mb-6">
                <span className="text-black">Tình trạng: </span>
                {product.stock > 0 ? (
                  <span className="text-green-600 font-medium">Còn {product.stock} {product.unit || 'sản phẩm'}</span>
                ) : (
                  <span className="text-red-600 font-medium">Hết hàng</span>
                )}
              </div>

              {/* Quantity */}
              {product.stock > 0 && (
                <div className="mb-6">
                  <div className="text-black font-medium mb-3">Số lượng:</div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="w-10 h-10 flex items-center text-black justify-center hover:bg-gray-100 transition-colors cursor-pointer"
                        disabled={quantity <= 1}
                      >
                        <MinusOutlined />
                      </button>
                      <input
                        type="text"
                        value={quantity}
                        readOnly
                        className="w-16 h-10 text-center border-x border-gray-300 text-black"
                      />
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="text-black w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
                        disabled={quantity >= product.stock}
                      >
                        <PlusOutlined />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                {product.stock > 0 ? (
                  <>
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingCartOutlined /> THÊM VÀO GIỎ
                    </button>
                    <Link
                      href={`/products/${product.id}`}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors text-center"
                    >
                      XEM CHI TIẾT
                    </Link>
                  </>
                ) : (
                  <Link
                    href={`/products/${product.id}`}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors text-center"
                  >
                    XEM CHI TIẾT
                  </Link>
                )}
              </div>

              {/* Description Preview */}
              {product.description && (
                <div className="border-t pt-4">
                  <h3 className="font-bold text-black mb-2">Mô tả sản phẩm:</h3>
                  <p className="text-black text-sm line-clamp-3">
                    {product.description.replace(/<[^>]*>/g, '')}
                  </p>
                  <Link
                    href={`/products/${product.id}`}
                    className="text-blue-600 text-sm hover:underline mt-2 inline-block"
                  >
                    Xem chi tiết →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
          message={alertModal.message}
          type={alertModal.type}
        />
    </Modal>
  );
}
