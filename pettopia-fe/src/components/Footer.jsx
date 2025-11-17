'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-teal-700 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-cyan-400">Pettopia</h3>
            <p className="text-gray-200 mb-6">
              Cung cấp dịch vụ chăm sóc thú y xuất sắc cho những người bạn thú cưng thân yêu của bạn từ năm 2005. 
              Sứ mệnh của chúng tôi là giúp mọi thú cưng đều có một cuộc sống khỏe mạnh và hạnh phúc.
            </p>
            <ul className="space-y-3 text-gray-200 mb-3">
              <li>
                <Link href="/join-us" className="hover:text-cyan-400 transition">
                  Bạn muốn trở thành Bác sĩ Thú y?
                </Link>
              </li>
            </ul>

            <div className="flex space-x-4">
              <a href="#" className="text-gray-200 hover:text-cyan-400 transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="text-gray-200 hover:text-cyan-400 transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919... (giữ nguyên SVG)" />
                </svg>
              </a>
              <a href="#" className="text-gray-200 hover:text-cyan-400 transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775... (giữ nguyên SVG)" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg text-cyan-400">
              Liên kết nhanh
            </h4>
            <ul className="space-y-3 text-gray-200">
              <li><Link href="/" className="hover:text-cyan-400 transition">Trang chủ</Link></li>
              <li><Link href="/about" className="hover:text-cyan-400 transition">Quét QR</Link></li>
              <li><Link href="/services" className="hover:text-cyan-400 transition">Dịch vụ</Link></li>
              <li><Link href="/contact" className="hover:text-cyan-400 transition">Liên hệ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg text-cyan-400">
              Dịch vụ
            </h4>
            <ul className="space-y-3 text-gray-200">
              <li>Quản lí thú cưng</li>
              <li>Lưu hồ sơ bệnh án</li>
              <li>Hỗ trợ đặt lịch nhanh chóng</li>
              <li>Cộng đồng giao tiêp</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg text-cyan-400">
              Thông tin liên hệ
            </h4>
            <ul className="space-y-3 text-gray-200">
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Thôn 3 Thạch Thất Hòa Lạc, Hà Nội</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>0346134562</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Pettopia1611@gmail.com</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div>Hỗ trợ 24/7 qua các cổng thông tin</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 pt-8 text-center text-gray-300">
          <p>&copy; 2025 Bệnh viện Thú y Pettopia. Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </footer>
  );
}