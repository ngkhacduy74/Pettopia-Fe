'use client';

import { useState } from 'react';
import StaffNavbar from '@/components/Navbar/StaffNavbar';

export default function layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [showSearch, setShowSearch] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
        <section>
            <div className="min-h-screen flex bg-gradient-to-b from-teal-50 to-white text-gray-900 relative">
                  {/* Navbar */}
                  <StaffNavbar
                    setShowSearch={setShowSearch}
                    showSearch={showSearch}
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                  />
            
                  {/* Nút mở menu chỉ hiển thị trên mobile */}
                  <button
                    className="md:hidden fixed top-4 left-4 z-30 p-2 bg-white border border-teal-100 rounded-lg shadow-md text-teal-700 hover:bg-teal-50 transition"
                    onClick={() => setIsMenuOpen(true)}
                  >
                    ☰
                  </button>
            
                  {/* Nội dung chính */}
                  <main className="flex-1 ml-0 md:ml-[16rem] p-10 md:p-12 bg-gray-50 rounded-tl-3xl shadow-inner transition-all duration-300">
                    {children}
                  </main>
                </div>
        </section>
    )
}
