'use client';
import React, { useState, useEffect } from 'react';
import {
  HomeIcon,
  DocumentCheckIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import { parseJwt, isTokenExpired } from '@/utils/jwt';

interface UserData {
  userId: string;
  fullname: string;
  gender?: string;
  email: { email_address: string; verified: boolean };
  phone_number?: string;
  username: string;
  dob: string;
  address: { city: string; district: string; ward: string; description: string };
}

interface ClinicNavbarProps {
  setShowSearch: (v: boolean) => void;
  showSearch: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenSettings?: () => void;
}

export default function Sidebar({
  setShowSearch,
  showSearch,
  isOpen,
  onClose,
  onOpenSettings,
}: ClinicNavbarProps) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      if (isTokenExpired(token)) {
        localStorage.removeItem('authToken');
        window.location.href = '/auth/login';
        return;
      }

      const decoded = parseJwt(token);
      if (!decoded) return;

      const user: UserData = {
        userId: decoded.id,
        fullname: decoded.fullname,
        email: decoded.email,
        phone_number: decoded.phone?.phone_number,
        username: decoded.username,
        dob: decoded.dob,
        address: decoded.address,
      };

      const roles = Array.isArray(decoded.role)
        ? decoded.role
        : decoded.role
        ? [decoded.role]
        : [];

      setUserRoles(roles);
      setUserData(user);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n, i, arr) =>
        i === 0 || i === arr.length - 1 ? n[0].toUpperCase() : ''
      )
      .join('');

  // 🧭 Menu theo role
  const roleMenus: Record<
    string,
    { label: string; href: string; icon: React.ReactNode }[]
  > = {
    Admin: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: <HomeIcon className="w-4 h-4" /> },
      { label: 'Manage Users', href: '/admin/manager-user', icon: <UsersIcon className="w-4 h-4" /> },
      { label: 'System Logs', href: '/admin/logs', icon: <ClipboardDocumentListIcon className="w-4 h-4" /> },
    ],
    Staff: [
      { label: 'Dashboard', href: '/staff/dashboard', icon: <HomeIcon className="w-4 h-4" /> },
      { label: 'Appointments', href: '/staff/appointments', icon: <ClipboardDocumentListIcon className="w-4 h-4" /> },
      { label: 'Clinic Request', href: '/staff/request-clinic-list', icon: <ClipboardDocumentListIcon className="w-4 h-4" /> },
      { label: 'Veterianrian Request', href: '/staff/request-vet-list', icon: <ClipboardDocumentListIcon className="w-4 h-4" /> },
    ],
    Clinic: [
      { label: 'Dashboard', href: '/clinic/dashboard', icon: <HomeIcon className="w-4 h-4" /> },
      { label: 'Request List', href: '/clinic/request-list', icon: <DocumentCheckIcon className="w-4 h-4" /> },
    ],
    Vet: [
      { label: 'Dashboard', href: '/vet/dashboard', icon: <HomeIcon className="w-4 h-4" /> },
      { label: 'Patient Records', href: '/vet/patients', icon: <ClipboardDocumentListIcon className="w-4 h-4" /> },
    ],
    User: [
      { label: 'My Dashboard', href: '/user/dashboard', icon: <HomeIcon className="w-4 h-4" /> },
      { label: 'My Requests', href: '/user/requests', icon: <DocumentCheckIcon className="w-4 h-4" /> },
    ],
  };

  // 🧭 Role Dashboard links (cho dropdown)
  const roleLinks: Record<string, string> = {
    Admin: '/admin/dashboard',
    Staff: '/staff/dashboard',
    Clinic: '/clinic/dashboard',
    Vet: '/vet/dashboard',
    User: '/user/dashboard',
  };

  // 🧩 Xác định role hiện tại theo pathname
  const detectedRole =
    pathname.includes('/admin/')
      ? 'Admin'
      : pathname.includes('/staff/')
      ? 'Staff'
      : pathname.includes('/clinic/')
      ? 'Clinic'
      : pathname.includes('/vet/')
      ? 'Vet'
      : pathname.includes('/user/')
      ? 'User'
      : userRoles[0] || '';

  const navItems = roleMenus[detectedRole] || [];

  // 🏷️ Tiêu đề theo role
  const roleTitleMap: Record<string, string> = {
    Admin: 'Admin Dashboard',
    Staff: 'Staff Panel',
    Clinic: 'Clinic Dashboard',
    Vet: 'Veterinarian Dashboard',
    User: 'User Dashboard',
  };

  const roleTitle = roleTitleMap[detectedRole] || '';

  return (
    <>
      {/* Overlay khi mở menu mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-teal-100 flex flex-col shadow-lg z-50 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Header */}
        <div className="p-3 border-b border-teal-100 relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-teal-50 cursor-pointer transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-28 mb-1 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-36 animate-pulse"></div>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {userData ? getInitials(userData.fullname) : '🐾'}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {userData?.fullname || 'Clinic Dashboard'}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {userData?.email?.email_address || 'user@example.com'}
                  </div>
                </div>
              </>
            )}
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Nút đóng trên mobile */}
          <button
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-teal-600 transition-colors absolute right-3 top-1/2 -translate-y-1/2"
          >
            ✕
          </button>

          {/* Dropdown cho profile */}
          {isDropdownOpen && (
            <div className="absolute left-3 right-3 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              {/* Cài đặt */}
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onOpenSettings?.();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-teal-50 transition-colors text-left"
              >
                <WrenchScrewdriverIcon className="w-5 h-5 text-teal-600" />
                <span className="text-sm font-medium text-gray-900">Cài đặt</span>
              </button>

              {/* Hồ sơ */}
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  alert('Profile clicked');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-teal-50 transition-colors text-left"
              >
                <svg
                  className="w-5 h-5 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-900">Hồ sơ</span>
              </button>

              {/* ✅ Chuyển dashboard theo role */}
              {userRoles.length > 0 && (
                <>
                  <div className="border-t border-gray-100 my-1"></div>
                  {userRoles.map((role) => (
                    <a
                      key={role}
                      href={roleLinks[role] || '#'}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-teal-50 transition-colors text-left"
                    >
                      <svg
                        className="w-5 h-5 text-teal-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm font-medium text-gray-900">{role} Dashboard</span>
                    </a>
                  ))}
                </>
              )}

              {/* Đăng xuất */}
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={() => {
                  localStorage.removeItem('authToken');
                  window.location.href = '/auth/login';
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
              >
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="text-sm font-medium text-red-600">Đăng xuất</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {roleTitle && (
            <div className="text-xs text-teal-600 font-semibold px-3 mb-2 uppercase tracking-wide">
              {roleTitle}
            </div>
          )}

          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
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
                {item.icon}
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Click outside để đóng dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </>
  );
}
