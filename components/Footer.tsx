'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PhoneOutlined, MailOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logo.png" alt="EC Study Logo" width={40} height={40} className="rounded-lg" />
              <h3 className="text-xl font-bold text-white">EC Study</h3>
            </div>
            <p className="text-sm mb-4">
              Cung cấp văn phòng phẩm chất lượng cao cho học sinh, sinh viên và doanh nghiệp.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <EnvironmentOutlined className="text-blue-500 mt-1" />
                <p>Tổ 6 khu 3 phường Uyên Hưng, Thị xã Tân Uyên, tỉnh Bình Dương</p>
              </div>
              <div className="flex items-center gap-2">
                <PhoneOutlined className="text-blue-500" />
                <a href="tel:0962215768" className="hover:text-white transition-colors">0962 215 768</a>
              </div>
              <div className="flex items-center gap-2">
                <ClockCircleOutlined className="text-blue-500" />
                <p>Thứ 2 - Thứ 6 (8h - 17h)</p>
              </div>
            </div>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/huong-dan-mua-hang" className="hover:text-white transition-colors">
                  Hướng dẫn mua hàng
                </Link>
              </li>
              <li>
                <Link href="/huong-dan-thanh-toan" className="hover:text-white transition-colors">
                  Hướng dẫn thanh toán
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-giao-hang" className="hover:text-white transition-colors">
                  Chính sách giao hàng
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-doi-tra" className="hover:text-white transition-colors">
                  Chính sách đổi trả và hoàn tiền
                </Link>
              </li>
              <li>
                <Link href="/khach-hang-than-thiet" className="hover:text-white transition-colors">
                  Khách hàng thân thiết
                </Link>
              </li>
              <li>
                <Link href="/khach-hang-uu-tien" className="hover:text-white transition-colors">
                  Khách hàng ưu tiên
                </Link>
              </li>
              <li>
                <Link href="/phan-anh-chat-luong" className="hover:text-white transition-colors">
                  Phản ánh chất lượng sản phẩm
                </Link>
              </li>
            </ul>
          </div>

          {/* About EC Study */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">About EC Study</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/gioi-thieu" className="hover:text-white transition-colors">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/dich-vu-in-an" className="hover:text-white transition-colors">
                  Dịch vụ in ấn quảng cáo
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-bao-mat" className="hover:text-white transition-colors">
                  Chính sách bảo mật chung
                </Link>
              </li>
              <li>
                <Link href="/bao-mat-thong-tin" className="hover:text-white transition-colors">
                  Chính sách bảo mật thông tin cá nhân
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="hover:text-white transition-colors">
                  Thông tin liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment & Shipping */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Thanh toán</h3>
            <div className="mb-6">
              <div className="bg-white rounded-lg p-3 inline-block">
                <Image 
                  src="/logo.png" 
                  alt="EC Pay" 
                  width={80} 
                  height={40}
                  className="object-contain"
                />
              </div>
              <p className="text-xs mt-2">Thanh toán qua EC Pay (Sắp ra mắt)</p>
            </div>

            <h3 className="text-lg font-semibold text-white mb-4">Đơn vị vận chuyển</h3>
            <div className="flex gap-3 flex-wrap">
              <div className="bg-white rounded-lg p-2">
                <Image 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzHMVvHBYAuko_X6HDacSxi_BItDFU4H5G2A&s" 
                  alt="Giao hàng tiết kiệm" 
                  width={60} 
                  height={30}
                  className="object-contain"
                />
              </div>
              <div className="bg-white rounded-lg p-2">
                <Image 
                  src="https://play-lh.googleusercontent.com/lYJIUHAYDkW294BP9VxnV2BhUc74ksB7hXQ5RUKhTW8gPinv_Tt9Xdu6ab2vRj5RO8M" 
                  alt="Giao hàng nhanh" 
                  width={60} 
                  height={30}
                  className="object-contain"
                />
              </div>
              <div className="bg-white rounded-lg p-2">
                <Image 
                  src="https://jobs.neu.edu.vn/storage/companies/eac4obwlw9lwz9b/202401231440me6ex1ehcr.jpg" 
                  alt="Viettel Post" 
                  width={60} 
                  height={30}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p>&copy; {new Date().getFullYear()} EC Study. All rights reserved.</p>
            <div className="flex gap-4 mt-2 md:mt-0">
              <Link href="/terms" className="hover:text-white transition-colors">
                Điều khoản sử dụng
              </Link>
              <span>|</span>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Chính sách bảo mật
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
