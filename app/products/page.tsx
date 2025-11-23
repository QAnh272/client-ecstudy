'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import ProductQuickView from '@/components/ProductQuickView';
import { api } from '@/lib/api';
import { SearchOutlined } from '@ant-design/icons';

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

interface ApiResponse {
  success: boolean;
  data: Product[];
  count?: number;
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      let endpoint = '/api/products';
      if (searchQuery) {
        endpoint = `/api/products/search?q=${encodeURIComponent(searchQuery)}`;
      }
      
      const response = await api.get<ApiResponse>(endpoint);
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get<{ success: boolean; data: string[] }>('/api/products/categories');
      if (response.success) {
        setCategories(['all', ...response.data]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(localSearchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    router.push('/products');
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-6">
          {searchQuery && (
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Kết quả tìm kiếm cho: &quot;{searchQuery}&quot;
              </h1>
              <p className="text-gray-600">
                Tìm thấy {filteredProducts.length} sản phẩm
              </p>
            </div>
          )}

          {/* Search Box */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative max-w-2xl">
              <input
                type="text"
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full px-5 py-3 pr-24 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                {localSearchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                  >
                    Xóa
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md flex items-center justify-center transition-colors cursor-pointer"
                >
                  <SearchOutlined className="text-base" />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Categories Filter */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-3 min-w-max md:flex-wrap md:min-w-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 md:px-6 py-2 rounded-full font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                }`}
              >
                {cat === 'all' ? 'Tất cả' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-gray-600">Đang tải sản phẩm...</div>
          </div>
        ) : (
          <>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-lg">
                <SearchOutlined className="text-6xl text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg mb-2">
                  {searchQuery 
                    ? `Không tìm thấy sản phẩm nào với từ khóa "${searchQuery}"`
                    : 'Không có sản phẩm nào'}
                </p>
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Xem tất cả sản phẩm
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">Đang tải...</div>
        </main>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
