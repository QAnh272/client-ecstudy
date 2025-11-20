'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authService } from '@/services/authService';
import { 
  DashboardOutlined, 
  ShoppingOutlined, 
  UserOutlined, 
  MenuOutlined,
  CloseOutlined,
  ShoppingCartOutlined,
  HomeOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
  activePage: string;
}

export default function AdminLayout({ children, activePage }: AdminLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const currentUser = authService.getStoredUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (currentUser.role !== 'admin') {
      router.push('/');
      return;
    }
    setUser(currentUser);
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined />, href: '/admin' },
    { key: 'products', label: 'Quản lý sản phẩm', icon: <ShoppingOutlined />, href: '/admin/products' },
    { key: 'orders', label: 'Quản lý đơn hàng', icon: <ShoppingCartOutlined />, href: '/admin/orders' },
    { key: 'users', label: 'Quản lý người dùng', icon: <UserOutlined />, href: '/admin/users' },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`bg-blue-900 text-white transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
      } lg:w-64 flex flex-col`}>
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="EC Study Logo" width={40} height={40} className="rounded-lg" />
            <div>
              <h1 className="text-2xl font-bold">EC Study</h1>
              <p className="text-blue-200 text-sm mt-1">Quản trị viên</p>
            </div>
          </div>
        </div>

        <nav className="p-4 flex flex-col flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activePage === item.key
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-800'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Bottom Menu Items */}
          <div className="mt-auto space-y-2 pt-4 border-t border-blue-800">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-blue-100 hover:bg-blue-800"
            >
              <span className="text-xl"><HomeOutlined /></span>
              <span>Trang chủ</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-blue-100 hover:bg-red-700 cursor-pointer"
            >
              <span className="text-xl"><LogoutOutlined /></span>
              <span>Đăng xuất</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            {sidebarOpen ? <CloseOutlined className="text-xl" /> : <MenuOutlined className="text-xl" />}
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {menuItems.find(item => item.key === activePage)?.label || 'Dashboard'}
          </h2>
          <div></div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
