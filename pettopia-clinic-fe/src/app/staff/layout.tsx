'use client';

import { useState } from 'react';
import Sidebar from '@/components/common/Sidebar';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { ToastProvider } from '@/contexts/ToastContext';

function StaffLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSearch, setShowSearch] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { isSidebarCollapsed } = useSidebar();

  return (
    <section>
      <div className="flex h-screen bg-gradient-to-b from-teal-50 to-white text-gray-900 relative">

        {/* Sidebar */}
        <Sidebar
          setShowSearch={setShowSearch}
          showSearch={showSearch}
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onOpenSettings={() => setIsSettingsModalOpen(true)} // ✅ Thêm hàm mở modal
        />

        {/* Nút mở menu trên mobile */}
        <button
          className="md:hidden fixed top-4 left-4 z-30 p-2 bg-white border border-teal-100 rounded-lg shadow-md text-teal-700 hover:bg-teal-50 transition"
          onClick={() => setIsMenuOpen(true)}
        >
          ☰
        </button>

        {/* Nội dung chính */}
        <main className={`flex-1 overflow-y-auto ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} p-10 md:p-12 bg-gradient-to-b from-teal-50 to-white transition-all duration-300`}>
          {children}
        </main>

        {/* ✅ Settings Modal — được chuyển ra ngoài sidebar */}
        {isSettingsModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                <button
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Nội dung modal */}
              <div className="p-6 space-y-6">
                {/* Account Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive updates about your clinic</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Push Notifications</p>
                        <p className="text-sm text-gray-500">Get alerts on your device</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5 text-teal-600" />
                    </div>
                  </div>
                </div>

                {/* Appearance */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Dark Mode</p>
                        <p className="text-sm text-gray-500">Switch to dark theme</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5 text-teal-600" />
                    </div>
                  </div>
                </div>

                {/* Privacy */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Profile Visibility</p>
                        <p className="text-sm text-gray-500">Make profile public</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-teal-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Settings saved!');
                    setIsSettingsModalOpen(false);
                  }}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ToastProvider>
        <StaffLayoutContent>{children}</StaffLayoutContent>
      </ToastProvider>
    </SidebarProvider>
  );
}
