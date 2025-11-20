'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authService } from '@/services/authService';
import { SearchOutlined, PhoneOutlined, UserOutlined, ShoppingCartOutlined, DownOutlined, LogoutOutlined, ProfileOutlined, DashboardOutlined, WalletOutlined} from '@ant-design/icons';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [cartCount, setCartCount] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadWalletBalance = async () => {
    try {
      const response = await api.get<{ success: boolean; data: { balance: number } }>('/api/wallet');
      if (response.success) {
        setWalletBalance(response.data.balance);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    }
  };

  const loadCartCount = async () => {
    try {
      const response = await api.get<{ success: boolean; data: { items: unknown[]; item_count: number } }>('/api/cart');
      if (response.success) {
        setCartCount(response.data.item_count);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setMounted(true);
      const authenticated = authService.isAuthenticated();
      setIsAuth(authenticated);
      setUser(authService.getStoredUser());
      
      if (authenticated) {
        loadWalletBalance();
        loadCartCount();
      }
    };
    initAuth();

    // Listen for cart update events
    const handleCartUpdate = () => {
      loadCartCount();
    };
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuth(false);
    setUser(null);
    setWalletBalance(0);
    setShowDropdown(false);
    router.push('/');
    router.refresh();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + 'đ';
  };

  return (
    <header className="bg-blue-700 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3">
            <Image src="/logo.png" alt="EC Study Logo" width={40} height={40} className="rounded-lg" />
            <div className="text-xl md:text-2xl font-bold whitespace-nowrap">EC Study</div>
          </Link>

          {/* Search bar - Hidden on mobile */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-4xl mx-4 lg:mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full px-5 py-3 pr-14 rounded-md bg-white text-gray-800 placeholder-gray-400 border border-gray-200 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-900 hover:bg-blue-800 text-white w-10 h-10 rounded-md flex items-center justify-center transition-colors cursor-pointer"
              >
                <SearchOutlined className="text-lg" />
              </button>
            </div>
          </form>

          {/* User actions */}
          <div className="flex items-center gap-3 md:gap-6">
            {/* Hotline */}
            <div className="hidden xl:flex items-center gap-3">
              <div className="bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center">
                <PhoneOutlined className="text-xl" />
              </div>
              <div className="text-left">
                <div className="text-base font-semibold leading-tight">1900 866 819</div>
                <div className="text-xs leading-tight">Hỗ trợ khách hàng</div>
              </div>
            </div>
            
            {/* Auth - Only render after mount to avoid hydration mismatch */}
            {mounted ? (
              isAuth && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="cursor-pointer flex items-center gap-3 hover:text-blue-200 transition-colors"
                  >
                    <div className="bg-blue-900 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <UserOutlined className="text-lg md:text-xl" />
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-base font-semibold leading-tight">{user.username}</div>
                      <div className="text-xs leading-tight flex items-center gap-1">
                        {user.role === 'admin' ? 'Quản trị' : 'Tài khoản'}
                        <DownOutlined className="text-xs" />
                      </div>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <WalletOutlined />
                          <span className="text-sm">Số dư ví</span>
                        </div>
                        <p className="text-lg font-bold text-blue-600">{formatPrice(walletBalance)}</p>
                      </div>
                      <Link
                        href="/wallet"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors"
                      >
                        <WalletOutlined className="text-lg" />
                        <span>Ví của tôi</span>
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors"
                        >
                          <DashboardOutlined className="text-lg" />
                          <span>Quản Lý Cửa Hàng</span>
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors"
                      >
                        <ProfileOutlined className="text-lg" />
                        <span>Thông tin cá nhân</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <LogoutOutlined className="text-lg" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login" className="flex items-center gap-3 hover:text-blue-200 transition-colors">
                    <div className="bg-blue-900 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <UserOutlined className="text-lg md:text-xl" />
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-base font-semibold leading-tight">Đăng nhập</div>
                      <Link href="/register" className="text-xs leading-tight hover:underline">Đăng ký</Link>
                    </div>
                  </Link>
                </div>
              )
            ) : (
              <div className="flex items-center gap-3">
                <div className="bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center">
                  <UserOutlined className="text-xl" />
                </div>
                <div className="text-left">
                  <div className="text-base font-semibold leading-tight">Đăng nhập</div>
                  <div className="text-xs leading-tight">Đăng ký</div>
                </div>
              </div>
            )}
            
            {/* Cart */}
            <Link href="/cart" className="relative hover:text-blue-200 transition-colors">
              <div className="text-2xl md:text-3xl"><ShoppingCartOutlined /></div>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearch} className="md:hidden mt-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full px-4 py-2 pr-12 rounded-md bg-white text-gray-800 placeholder-gray-400 text-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-900 hover:bg-blue-800 text-white w-8 h-8 rounded-md flex items-center justify-center cursor-pointer"
            >
              <SearchOutlined className="text-base" />
            </button>
          </div>
        </form>
      </div>
    </header>
  );
}
