/**
 * Products Management Page
 * Admin panel for managing products (CRUD operations)
 */
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/AdminLayout';
import { api } from '@/lib/api';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';

interface Product {
  id: string;
  category: string;
  name: string;
  product_code: string;
  description: string;
  unit: string;
  price: number;
  stock: number;
  image_url?: string;
}

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    product_code: '',
    description: '',
    unit: 'Cây',
    price: '',
    stock: '',
    image_url: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [oldImageUrl, setOldImageUrl] = useState<string>('');
  const [customUnits, setCustomUnits] = useState<string[]>([]);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [newUnit, setNewUnit] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  // Lock body scroll khi modal mở
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get<any>('/api/products');
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setFormData({
      category: '',
      name: '',
      product_code: '',
      description: '',
      unit: 'Cây',
      price: '',
      stock: '',
      image_url: '',
    });
    setImageFile(null);
    setImagePreview('');
    setOldImageUrl('');
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      category: product.category || '',
      name: product.name || '',
      product_code: product.product_code || '',
      description: product.description || '',
      unit: product.unit || 'Cây',
      price: product.price ? product.price.toString() : '0',
      stock: product.stock ? product.stock.toString() : '0',
      image_url: product.image_url || '',
    });
    setImageFile(null);
    setImagePreview(product.image_url || '');
    setOldImageUrl(product.image_url || '');
    setShowModal(true);
  };

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleAddUnit = useCallback(() => {
    if (newUnit.trim() && !customUnits.includes(newUnit.trim())) {
      setCustomUnits([...customUnits, newUnit.trim()]);
      setFormData({ ...formData, unit: newUnit.trim() });
      setNewUnit('');
      setShowAddUnit(false);
    }
  }, [newUnit, customUnits, formData]);

  const handleUnitKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddUnit();
    }
  }, [handleAddUnit]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let uploadedImageUrl = formData.image_url;

      if (imageFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('image', imageFile);
        if (oldImageUrl) formDataUpload.append('oldImageUrl', oldImageUrl);

        const uploadResponse = await api.post<{ imageUrl: string }>(
          '/api/products/upload-image',
          formDataUpload,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );

        uploadedImageUrl = uploadResponse.imageUrl;
      }

      const data = {
        category: formData.category,
        name: formData.name,
        product_code: formData.product_code,
        description: formData.description,
        unit: formData.unit,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image_url: uploadedImageUrl || null,
      };

      if (editingProduct) {
        await api.put(`/api/products/${editingProduct.id}`, data);
      } else {
        await api.post('/api/products', data);
      }

      setShowModal(false);
      loadProducts();
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra');
    }
  }, [formData, imageFile, oldImageUrl, editingProduct]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      loadProducts();
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra');
    }
  }, []);

  const filteredProducts = useMemo(() =>
    products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    ), [products, searchQuery]
  );

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset về trang 1 khi search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <AdminLayout activePage="products">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <SearchOutlined className="absolute left-3 top-3 text-gray-400" />
          </div>

          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 hover:shadow-lg hover:scale-105 font-medium cursor-pointer"
          >
            <PlusOutlined />
            Thêm sản phẩm
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden animate-slideUp">
          {loading ? (
            <div className="p-8 text-center text-gray-600">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2">Đang tải...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Hình ảnh</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Danh mục</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Tên sản phẩm</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Mã SP</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Đặc điểm kỹ thuật</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Đơn vị</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Giá (VNĐ)</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Tồn kho</th>
                    <th className="text-right py-3 px-4 text-gray-600 font-medium">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedProducts.map((product) => (
                    <tr key={product.id} className="border-t hover:bg-blue-50 transition-colors duration-150">
                      <td className="py-3 px-4">
                        {product.image_url && product.image_url.trim() && (product.image_url.startsWith('http') || product.image_url.startsWith('/')) ? (
                          <div className="relative w-12 h-12 rounded border overflow-hidden">
                            <Image
                              src={
                                product.image_url && product.image_url.trim()
                                  ? product.image_url.startsWith('http')
                                    ? product.image_url
                                    : `${process.env.NEXT_PUBLIC_API_URL || ''}${product.image_url}`
                                  : '/placeholder.png'
                              }
                              alt={product.name}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.png';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                            No img
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {product.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-gray-900 font-medium max-w-xs">
                        {product.name}
                      </td>

                      <td className="py-3 px-4 text-gray-700 text-sm">{product.product_code}</td>

                      <td className="py-3 px-4 text-gray-600 text-sm max-w-md">
                        <div className="line-clamp-2">{product.description}</div>
                      </td>

                      <td className="py-3 px-4 text-gray-700 text-sm">{product.unit}</td>

                      <td className="py-3 px-4 text-gray-900 font-semibold">
                        {product.price.toLocaleString('vi-VN')}
                      </td>

                      <td className="py-3 px-4">
                        {product.stock === 0 ? (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-medium">
                            Hết hàng
                          </span>
                        ) : (
                          <span className="text-gray-900">{product.stock}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 p-2 rounded-lg transition-all duration-150 mr-2 cursor-pointer"
                        >
                          <EditOutlined />
                        </button>

                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-100 p-2 rounded-lg transition-all duration-150 cursor-pointer"
                        >
                          <DeleteOutlined />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-3">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Trước
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[40px] px-4 py-2 rounded-lg cursor-pointer transition-colors ${currentPage === page
                      ? 'bg-blue-600 text-white font-semibold shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================== MODAL SỬA LẠI ĐẸP ========================== */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 p-4 bg-black/50 flex items-center justify-center"
          onClick={() => setShowModal(false)}
          style={{ willChange: 'opacity' }}
        >
          <div
            className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transform transition-transform duration-200"
            onClick={(e) => e.stopPropagation()}
            style={{ willChange: 'transform' }}
          >
            {/* Header */}
            <div className="bg-linear-to-r from-blue-600 to-blue-500 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h3 className="text-2xl font-bold text-white">
                {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h3>

              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-2xl cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Bút bi, Thước kẻ..."
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              {/* Product Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mã sản phẩm</label>
                <input
                  type="text"
                  required
                  value={formData.product_code}
                  onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="TL-027..."
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Đặc điểm kỹ thuật</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Nét 0.5mm, màu xanh..."
                />
              </div>

              {/* Unit - Price - Stock */}
              <div className="grid grid-cols-3 gap-4">
                {/* Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đơn vị tính</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                      >
                        <option value="Cây">Cây</option>
                        <option value="Combo">Combo</option>
                        <option value="Bộ">Bộ</option>
                        <option value="Hộp 12 màu">Hộp 12 màu</option>
                        <option value="Hộp 24 màu">Hộp 24 màu</option>
                        <option value="Hộp 18 màu">Hộp 18 màu</option>
                        <option value="Hộp 60 màu">Hộp 60 màu</option>
                        <option value="Hộp 10 cây">Hộp 10 cây</option>
                        <option value="Ví 2">Ví 2</option>
                        <option value="Ví 5 ruột">Ví 5 ruột</option>
                        {customUnits.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => setShowAddUnit(!showAddUnit)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-gray-700 font-medium cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {showAddUnit && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newUnit}
                          onChange={(e) => setNewUnit(e.target.value)}
                          placeholder="Nhập đơn vị mới..."
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-black"
                          onKeyDown={handleUnitKeyDown}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Giá (VNĐ)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh sản phẩm</label>

                <div className="flex items-start gap-4">
                  {imagePreview && (
                    <div className="relative w-24 h-24 border-2 border-gray-300 rounded-lg overflow-hidden">
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized />
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="inline-block px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      {imagePreview ? 'Thay đổi ảnh' : 'Chọn ảnh'}
                    </label>
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG, GIF (tối đa 5MB)</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t mt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer"
                >
                  {editingProduct ? 'Cập nhật' : 'Thêm mới'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-md cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
