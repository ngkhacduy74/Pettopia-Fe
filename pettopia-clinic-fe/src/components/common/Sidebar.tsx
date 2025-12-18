'use client';
import React, { useState, useEffect } from 'react';
import {
  HomeIcon,
  DocumentTextIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  UserCircleIcon,
  UserGroupIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import { parseJwt, isTokenExpired } from '@/utils/jwt';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/services/auth/authService';
import { useSidebar } from '@/contexts/SidebarContext';
import RoleSwitcher from '@/components/common/RoleSwitcher';

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
  const router = useRouter();
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useSidebar();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
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

  const roleMenus: Record<
    string,
    { label: string; href: string; icon: React.ReactNode }[]
  > = {
    Admin: [
      { label: 'Tổng quan', href: '/admin/dashboard', icon: <HomeIcon className="w-5 h-5" /> },
      { label: 'Quản lí người dùng', href: '/admin/manager-user', icon: <UsersIcon className="w-5 h-5" /> },
      { label: 'Quản lí bệnh viện', href: '/admin/manager-clinic', icon: <UsersIcon className="w-5 h-5" /> },
    
    ],
    Staff: [
      { label: 'Trang chủ', href: '/staff/dashboard', icon: <HomeIcon className="w-5 h-5" /> },
      { label: 'Xét duyệt Phòng khám', href: '/staff/request-clinic-list', icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
      { label: 'Xét duyệt Bác Sĩ', href: '/staff/request-vet-list', icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
      { label: 'Quản lý bài viết', href: '/staff/post-report', icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },

    ],
    Clinic: [
      { label: 'Tổng quan', href: '/clinic/dashboard', icon: <HomeIcon className="w-5 h-5" /> },
      { label: 'Quản lý bác sĩ', href: '/clinic/vet', icon: <UserGroupIcon className="w-5 h-5" /> },
      { label: 'Ca làm', href: '/clinic/shift', icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
      { label: 'Dịch vụ', href: '/clinic/service', icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
      { label: 'Lịch khám', href: '/clinic/appointment', icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
      { label: 'Duyệt Đơn', href: '/clinic/check-in', icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
      { label: 'Gán Bác Sĩ', href: '/clinic/assign-vet', icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
      { label: 'Lịch sử khám', href: '/clinic/medical', icon: <QuestionMarkCircleIcon className="w-5 h-5" /> },
    ],
    Vet: [
      { label: 'Trang chính', href: '/vet/main', icon: <HomeIcon className="w-5 h-5" /> },
      { label: 'Hồ sơ bệnh án', href: '/vet/patients', icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },

    ],
    User: [
      { label: 'Hướng dẫn', href: '/user/dashboard', icon: <HomeIcon className="w-5 h-5" /> },
      { label: 'Nộp hồ sơ bác sĩ', href: '/user/submit-vet-certificate', icon: <DocumentTextIcon className="w-5 h-5" /> },
      { label: 'Nộp hồ sơ phòng khám', href: '/user/submit-clinic-certificate', icon: <DocumentTextIcon className="w-5 h-5" /> },
    ],
  };

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

  const roleTitleMap: Record<string, string> = {
    Admin: 'Admin',
    Staff: 'Staff',
    Clinic: 'Clinic',
    Vet: 'Veterinarian',
    User: 'User',
  };

  const roleTitle = roleTitleMap[detectedRole] || '';

  const handleLogoutClick = () => {
    logoutUser();
    setTimeout(() => {
      window.location.href = '/auth/login';
      if (window.history && window.history.length > 1) {
        window.history.forward();
      }
    }, 500);
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
        />
      )}

      <div
        className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} fixed top-0 left-0 h-screen bg-gradient-to-b from-white to-gray-50 border-r border-teal-100 flex flex-col shadow-xl z-50 transform transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo Header */}
        <div className="p-4 border-b border-teal-100 flex flex-col gap-2">
          {!isSidebarCollapsed && (
            <>
              {/* When sidebar is open */}
              <div className="flex items-center justify-between gap-2">
                {/* Logo and text on the left */}
                <div className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                  <div className="w-8 h-8 bg-gradient-to-br rounded-lg flex items-center justify-center flex-shrink-0">
                    <img src="/sampleimg/logo.png" alt="Pettopia Logo" className="w-8 h-8" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-lg font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent truncate">
                      Pettopia
                    </span>
                  </div>
                </div>

                {/* Collapse button on the right */}
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  title={isSidebarCollapsed ? 'Mở sidebar' : 'Đóng sidebar'}
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarCollapsed ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                  </svg>
                </button>
              </div>
            </>
          )}

          {isSidebarCollapsed && (
            <>
              {/* When sidebar is collapsed */}
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-br rounded-lg flex items-center justify-center">
                  <img src="/sampleimg/logo.png" alt="Pettopia Logo" className="w-8 h-8" />
                </div>
              </div>

              {/* Collapse button below logo */}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 w-full flex justify-center"
                title={isSidebarCollapsed ? 'Mở sidebar' : 'Đóng sidebar'}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarCollapsed ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {roleTitle && !isSidebarCollapsed && (
            <div className="text-xs text-teal-600 font-bold px-3 mb-4 uppercase tracking-widest">
              {roleTitle}
            </div>
          )}
          {roleTitle && isSidebarCollapsed && <div className="h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent mx-2 mb-2"></div>}

          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const key = `${item.href}-${item.label}`;
            return (
              <a
                key={key}
                href={item.href}
                className={`w-full flex ${isSidebarCollapsed ? 'justify-center' : 'items-center'} gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-200'
                    : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </a>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-teal-100 bg-gradient-to-r from-teal-50 to-transparent space-y-3">
          {/* User Profile Button */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full flex ${isSidebarCollapsed ? 'justify-center' : 'items-center'} gap-3 p-3 rounded-xl hover:bg-teal-100 transition-colors duration-200 group`}
            >
              {isLoading ? (
                <>
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                  {!isSidebarCollapsed && (
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded-lg w-24 animate-pulse" />
                      <div className="h-2 bg-gray-200 rounded-lg w-32 animate-pulse" />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-md">
                    {userData ? getInitials(userData.fullname) : '👤'}
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {userData?.fullname || 'Dashboard'}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {roleTitle}
                      </div>
                    </div>
                  )}
                </>
              )}
              {!isSidebarCollapsed && (
                <ChevronDownIcon
                  className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              )}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && !isSidebarCollapsed && (
              <div className="absolute left-0 right-0 bottom-20 bg-white rounded-xl shadow-xl border border-teal-100 py-2 z-50 space-y-1">
                {/* Settings */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onOpenSettings?.();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-teal-50 rounded-lg transition-colors text-left text-sm"
                >
                  <Cog6ToothIcon className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-900 font-medium">Cài đặt</span>
                </button>

                {/* Profile */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    const profilePath = 
                      detectedRole === 'Admin' ? '/admin/profile' :
                      detectedRole === 'Staff' ? '/staff/profile' :
                      detectedRole === 'Clinic' ? '/clinic/profile' :
                      detectedRole === 'Vet' ? '/vet/profile' :
                      '/user/profile';
                    router.push(profilePath);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-teal-50 rounded-lg transition-colors text-left text-sm"
                >
                  <UserCircleIcon className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-900 font-medium">Hồ sơ</span>
                </button>

                {/* Role Switcher */}
                {userRoles.length > 1 && (
                  <>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsRoleSwitcherOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-lg transition-colors text-left text-sm"
                    >
                      <ArrowPathIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-900 font-medium">Chuyển Role</span>
                    </button>
                  </>
                )}

                {/* Change Password */}
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push('/change-password');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 rounded-lg transition-colors text-left text-sm"
                >
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span className="text-gray-900 font-medium">Đổi mật khẩu</span>
                </button>

                {/* Logout */}
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-lg transition-colors text-left text-sm"
                >
                  <ArrowLeftStartOnRectangleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span className="text-red-600 font-medium">Đăng xuất</span>
                </button>
              </div>
            )}
          </div>

          {/* Copyright */}
          <div className="text-xs text-gray-500 text-center">
            <p>© 2025 Clinic System</p>
          </div>
        </div>
      </div>

      {/* Overlay for dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      {/* Role Switcher Modal */}
      <RoleSwitcher
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
        userRoles={userRoles}
        currentRole={detectedRole}
      />
    </>
  );
}