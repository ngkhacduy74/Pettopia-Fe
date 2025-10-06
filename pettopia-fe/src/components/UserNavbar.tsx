'use client';
import React from 'react';

interface UserNavbarProps {
  setShowSearch: (v: boolean) => void;
  showSearch: boolean;
}

export default function UserNavbar({ setShowSearch, showSearch }: UserNavbarProps) {
  return (
    <div className="w-64 bg-white border-r border-teal-100 flex flex-col shadow-sm">
      {/* User Section */}
      <div className="p-3 border-b border-teal-100">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-teal-50 cursor-pointer transition-colors">
          <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-cyan-600 rounded flex items-center justify-center text-xs font-bold text-white">
            🐾
          </div>
          <span className="text-sm font-medium flex-1 text-gray-900">My Pet Care</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 text-gray-700 text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Tìm kiếm</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Trang chủ</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 text-gray-700 text-sm transition-colors">
            <span className="text-base"></span>
            <span>Hồ sơ Pet</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 text-gray-700 text-sm transition-colors">
            <span className="text-base"></span>
            <span>Community</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <div className="text-xs text-teal-600 font-semibold px-3 mb-2 uppercase tracking-wide">Truy cập nhanh</div>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 text-gray-700 text-sm transition-colors">
              <span className="text-base"></span>
              <span>Nhật ký Pet</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 text-gray-700 text-sm transition-colors">
              <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Lịch khám</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 text-gray-700 text-sm transition-colors">
              <span className="text-base"></span>
              <span>Đơn thuốc</span>
            </button>
          </div>
        </div>

        {/* Services */}
        <div className="mt-6">
          <div className="text-xs text-teal-600 font-semibold px-3 mb-2 uppercase tracking-wide">Dịch vụ</div>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 text-gray-700 text-sm transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm dịch vụ</span>
          </button>
        </div>

        {/* My Pets */}
        <div className="mt-6">
          <div className="text-xs text-teal-600 font-semibold px-3 mb-2 uppercase tracking-wide">Thú cưng của tôi</div>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 text-gray-700 text-sm transition-colors">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs">
                
              </div>
              <span>Milu</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 text-gray-700 text-sm transition-colors">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-xs">
                
              </div>
              <span>Kitty</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-teal-100">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 text-gray-700 text-sm transition-colors">
          <div className="w-6 h-6 bg-gradient-to-br from-teal-100 to-cyan-100 rounded flex items-center justify-center">
            <svg className="w-3 h-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
          <span>Nâng cấp Premium</span>
        </button>
      </div>
    </div>
  );
}