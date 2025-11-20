'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import { api } from '@/lib/api';
import { MinusOutlined, PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
  product_code: string;
  description: string;
  unit: string;
  average_rating?: number;
  rating_count?: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadProduct(params.id as string);
    }
  }, [params.id]);

  const loadProduct = async (id: string) => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: Product }>(`/api/products/${id}`);
      if (response.success) {
        setProduct(response.data);
      }
    } catch (error) {
      console.error('Error loading product:', error);
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

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await api.post('/api/cart/items', {
        product_id: product.id,
        quantity: quantity
      });
      alert('Đã thêm vào giỏ hàng!');
      // Dispatch event to update cart count in header
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Có lỗi xảy ra khi thêm vào giỏ hàng');
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    try {
      await api.post('/api/cart/items', {
        product_id: product.id,
        quantity: quantity
      });
      // Dispatch event to update cart count in header
      window.dispatchEvent(new Event('cartUpdated'));
      router.push('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Có lỗi xảy ra khi thêm vào giỏ hàng');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="text-gray-600">Đang tải...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <p className="text-gray-500">Không tìm thấy sản phẩm</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-6">
          <span className="hover:text-blue-600 cursor-pointer" onClick={() => router.push('/')}>
            Trang chủ
          </span>
          {' > '}
          <span className="text-gray-800">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 bg-white rounded-lg shadow-sm p-4 md:p-6">
          {/* Left: Images */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {imageError ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ShoppingCartOutlined style={{ fontSize: '64px' }} />
                </div>
              ) : (
                <Image
                  src={product.image_url || '/placeholder.png'}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                  unoptimized={product.image_url?.includes('localhost')}
                />
              )}
            </div>
          </div>

          {/* Right: Product Info */}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star} 
                    className={`text-lg ${
                      (product.average_rating || 0) >= star 
                        ? 'text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-gray-600 text-sm">
                {product.average_rating ? product.average_rating.toFixed(1) : '0.0'}/5.0 ({product.rating_count || 0} đánh giá)
              </span>
            </div>

            {/* Brand and SKU */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-600">Thương hiệu: </span>
                <span className="text-blue-600 font-medium">Thiên Long</span>
              </div>
              <div className="hidden sm:block text-gray-300">|</div>
              <div>
                <span className="text-gray-600">Mã sản phẩm: </span>
                <span className="text-black font-medium">{product.product_code}</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <span className="text-3xl font-bold text-blue-600">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <div className="text-black font-medium mb-3">Số lượng:</div>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors text-black cursor-pointer"
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
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors text-black cursor-pointer"
                  >
                    <PlusOutlined />
                  </button>
                </div>
                <span className="text-black text-sm">
                  ({product.stock} sản phẩm có sẵn)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingCartOutlined /> THÊM VÀO GIỎ
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors cursor-pointer"
              >
                MUA NGAY
              </button>
            </div>

            {/* Product Details Link */}
            <div className="text-center">
              <a href="#details" className="text-red-600 font-medium hover:underline">
                {'>> Xem chi tiết sản phẩm'}
              </a>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div id="details" className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Mô tả sản phẩm</h2>
          <div className="prose max-w-none text-gray-700">
            {product.description ? (
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            ) : (
              <p>Chưa có mô tả chi tiết cho sản phẩm này.</p>
            )}
          </div>

          {/* Product Specifications */}
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Thông số kỹ thuật</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex">
                <span className="font-medium text-gray-700 w-40">Danh mục:</span>
                <span className="text-gray-600">{product.category}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-40">Đơn vị:</span>
                <span className="text-gray-600">{product.unit}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-40">Mã sản phẩm:</span>
                <span className="text-gray-600">{product.product_code}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-40">Tồn kho:</span>
                <span className="text-gray-600">{product.stock} {product.unit}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
