'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';

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
  created_at?: string;
  average_rating?: number;
  rating_count?: number;
}

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + 'đ';
  };
  
  // Xử lý URL ảnh
  const getImageUrl = () => {
    if (!product.image_url) return '/placeholder.png';
    
    // Nếu là URL đầy đủ (http/https)
    if (product.image_url.startsWith('http://') || product.image_url.startsWith('https://')) {
      return product.image_url;
    }
    
    // Nếu là đường dẫn tương đối, thêm base URL của API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return `${apiUrl}${product.image_url.startsWith('/') ? '' : '/'}${product.image_url}`;
  };

  // Kiểm tra sản phẩm mới (tạo trong vòng 7 ngày)
  const isNew = () => {
    if (!product.created_at) return false;
    const createdDate = new Date(product.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Product Image */}
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ShoppingCartOutlined style={{ fontSize: '48px' }} />
            </div>
          ) : (
            <Image
              src={getImageUrl()}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              onError={() => setImageError(true)}
              unoptimized
            />
          )}
          
          {/* Badges */}
          {isNew() && (
            <div className="absolute top-2 left-2">
              <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                New
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-3 md:p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-xs sm:text-sm font-medium text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 transition-colors min-h-8 sm:min-h-10">
            {product.name}
          </h3>
        </Link>

        {/* Rating - Hiển thị sao dựa trên đánh giá thực tế */}
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <span 
              key={star} 
              className={`text-sm ${
                (product.average_rating || 0) >= star 
                  ? 'text-yellow-400' 
                  : 'text-gray-300'
              }`}
            >
              ★
            </span>
          ))}
          <span className="text-gray-500 text-xs ml-1">
            {product.average_rating ? product.average_rating.toFixed(1) : '0.0'} ({product.rating_count || 0})
          </span>
        </div>

        {/* Price */}
        <div className="mb-3">
          <span className="text-blue-600 font-bold text-base md:text-lg">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Stock Info */}
        {product.stock > 0 ? (
          <span className="text-green-600 text-xs">Còn hàng</span>
        ) : (
          <span className="text-red-600 text-xs">Hết hàng</span>
        )}

        {/* View Detail Button */}
        <button
          onClick={() => onQuickView(product)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors mt-3 cursor-pointer text-xs sm:text-sm"
        >
          <EyeOutlined /> XEM NHANH
        </button>
      </div>
    </div>
  );
}
