'use client'
import React, { useState } from 'react';
import UserNavbar from '@/components/UserNavbar';

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSearch, setShowSearch] = useState<boolean>(false);

  return (
    <div className="flex h-screen bg-gradient-to-b from-teal-50 to-white text-gray-900">
      {/* Sidebar Navigation */}
      <UserNavbar setShowSearch={setShowSearch} showSearch={showSearch} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50" onClick={() => setShowSearch(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-teal-100" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-teal-100">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="flex-1 bg-transparent outline-none text-gray-900"
                  autoFocus
                />
                <button onClick={() => setShowSearch(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
