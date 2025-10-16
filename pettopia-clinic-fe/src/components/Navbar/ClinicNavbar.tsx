'use client';
import React from 'react';
import { HomeIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';

interface ClinicNavbarProps {
  setShowSearch: (v: boolean) => void;
  showSearch: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ClinicNavbar({
  setShowSearch,
  showSearch,
  isOpen,
  onClose,
}: ClinicNavbarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <HomeIcon className="w-4 h-4" />,
    },
    {
      label: 'Request',
      href: '/clinic/request-list',
      icon: <DocumentCheckIcon className="w-4 h-4" />,
    }
  ];

  return (
    <>
      {/* Overlay khi mở menu mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
        ></div>
      )}

      {/* Navbar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-teal-100 flex flex-col shadow-lg z-50 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Header */}
        <div className="p-3 border-b border-teal-100 flex items-center justify-between">
          <div className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors">
            <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-cyan-600 rounded flex items-center justify-center text-xs font-bold text-white">
              🐾
            </div>
            <span className="text-sm font-medium text-gray-900">Clinic's Dashboard</span>
          </div>

          {/* Nút đóng trên mobile */}
          <button
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-teal-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold shadow-sm'
                    : 'text-gray-700 hover:bg-teal-50'
                }`}
              >
                {item.icon && item.icon}
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
}
